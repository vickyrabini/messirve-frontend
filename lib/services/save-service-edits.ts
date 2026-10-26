import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseLocation } from '@/lib/parse-location'
import { normalizePhone } from '@/lib/normalize-phone'
import { MAX_FILE_SIZE, MIME_TO_EXT, toSlug } from '@/lib/services/service-photos'

// Núcleo compartido de edición de un servicio (dueño y admin). NO es un 'use server':
// no expone acciones públicas. Quien lo llama es responsable de autenticar/autorizar y
// de elegir el cliente `db` (sesión → RLS + whitelist de columnas; admin → bypass).
// Las fotos siempre se manejan con el cliente admin porque el bucket lo requiere.
export async function saveServiceEdits(
  db: SupabaseClient,
  existing: { photos: string[] | null },
  serviceId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const categoryId = (formData.get('categoryId') as string)?.trim()
  const name = (formData.get('name') as string)?.trim().toUpperCase()
  if (!categoryId || !name) return { error: 'La categoría y el nombre de la marca son obligatorios' }

  const description = (formData.get('description') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const location = parseLocation(formData)
  if (!location) return { error: 'La ubicación elegida en el mapa no es válida' }
  const city = (formData.get('city') as string)?.trim() || 'Barcelona'
  const phoneResult = normalizePhone(formData.get('phone'))
  if ('error' in phoneResult) return { error: phoneResult.error }
  const { phone } = phoneResult
  const website = (formData.get('website') as string)?.trim() || null
  const instagram = (formData.get('instagram') as string)?.trim() || null

  const photoFiles = formData.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)

  for (const file of photoFiles) {
    if (!file.type.startsWith('image/')) return { error: 'Solo se permiten archivos de imagen' }
    if (file.size > MAX_FILE_SIZE) return { error: `La imagen "${file.name}" supera el límite de 5MB` }
  }

  // No new files → keep existing photos. New files → subir y confirmar el update de la
  // DB ANTES de tocar las fotos viejas en storage: si algo falla a mitad de camino, las
  // fotos viejas siguen ahí y la fila sigue apuntando a ellas — nunca quedan URLs muertas.
  let photos: string[] = existing.photos ?? []
  let oldPaths: string[] = []
  const uploadedPaths: string[] = []
  if (photoFiles.length > 0) {
    const admin = createAdminClient()

    const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-photos/`
    oldPaths = (existing.photos as string[])
      .filter((url) => typeof url === 'string' && url.startsWith(storageBase))
      .map((url) => url.slice(storageBase.length))

    const slug = toSlug(name)
    photos = []
    for (const file of photoFiles) {
      const ext = MIME_TO_EXT[file.type]
      if (!ext) {
        if (uploadedPaths.length > 0) await admin.storage.from('service-photos').remove(uploadedPaths)
        return { error: 'Formato de imagen no soportado (usá JPG, PNG, WEBP o GIF)' }
      }
      const path = `${slug}/${randomUUID()}.${ext}`
      const { error: uploadError } = await admin.storage.from('service-photos').upload(path, file, { contentType: file.type })
      if (uploadError) {
        if (uploadedPaths.length > 0) await admin.storage.from('service-photos').remove(uploadedPaths)
        return { error: 'No se pudo subir una de las imágenes. Intentá de nuevo.' }
      }
      uploadedPaths.push(path)
      const { data: urlData } = admin.storage.from('service-photos').getPublicUrl(path)
      photos.push(urlData.publicUrl)
    }
  }

  const { error } = await db
    .from('services')
    .update({ category_id: categoryId, name, description, address, ...location, city, phone, website, instagram, photos })
    .eq('id', serviceId)

  if (error) {
    if (uploadedPaths.length > 0) await createAdminClient().storage.from('service-photos').remove(uploadedPaths)
    return { error: 'No se pudo actualizar el servicio. Intentá de nuevo.' }
  }

  // La DB ya apunta a las fotos nuevas — recién ahora es seguro borrar las viejas.
  if (oldPaths.length > 0) {
    await createAdminClient().storage.from('service-photos').remove(oldPaths)
  }

  return { error: null }
}
