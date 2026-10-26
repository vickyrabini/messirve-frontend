'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseLocation } from '@/lib/parse-location'
import { normalizePhone } from '@/lib/normalize-phone'
import { MAX_FILE_SIZE, MIME_TO_EXT, toSlug } from '@/lib/services/service-photos'
import { saveServiceEdits } from '@/lib/services/save-service-edits'

export async function toggleLike(formData: FormData): Promise<void> {
  const serviceId = formData.get('serviceId') as string
  const wasLiked = formData.get('liked') === 'true'

  if (!serviceId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = wasLiked
    ? await supabase.from('service_likes').delete().eq('user_id', user.id).eq('service_id', serviceId)
    : await supabase.from('service_likes').insert({ user_id: user.id, service_id: serviceId })

  if (error) {
    console.log('[toggleLike] error:', { message: error.message, details: error.details, hint: error.hint, code: error.code })
    return
  }

  revalidatePath('/dashboard')
}

export type ServiceFormState = { error: string | null; success?: boolean }

export async function createService(_state: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión' }
  }

  // Defense in depth — verify the role server-side, never trust the page-level gate alone
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'client' && profile?.role !== 'user') {
    return { error: 'No tenés permiso para crear servicios' }
  }

  // A 'client' already paid — their service publishes immediately, same as always.
  // A 'user' is going through the new flow: service starts pending admin approval, publishes after payment.
  const isAlreadyClient = profile.role === 'client'

  // Defense in depth — the page-level redirect (services/new/page.tsx) is bypassable via
  // double-submit or multiple tabs; without this, a duplicate row breaks every .maybeSingle()
  // lookup keyed on user_id downstream (checkout, webhook activation, dashboard).
  const { data: ownService } = await supabase.from('services').select('id').eq('user_id', user.id).maybeSingle()
  if (ownService) {
    return { error: 'Ya tenés un servicio publicado' }
  }

  const categoryId = (formData.get('categoryId') as string)?.trim()
  const name = (formData.get('name') as string)?.trim().toUpperCase()

  if (!categoryId || !name) {
    return { error: 'La categoría y el nombre de la marca son obligatorios' }
  }

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
    if (!file.type.startsWith('image/')) {
      return { error: 'Solo se permiten archivos de imagen' }
    }
    if (file.size > MAX_FILE_SIZE) {
      return { error: `La imagen "${file.name}" supera el límite de 5MB` }
    }
  }

  // Admin client — a 'user' isn't covered by the RLS insert policy (role = 'client' only), and we've
  // already verified the role server-side above. Same pattern as registerClient. Also needed for storage.
  const admin = createAdminClient()

  const photos: string[] = []
  const uploadedPaths: string[] = []
  if (photoFiles.length > 0) {
    const slug = toSlug(name)

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

  const { error } = await admin.from('services').insert({
    category_id: categoryId,
    name,
    description,
    address,
    ...location,
    city,
    phone,
    website,
    instagram,
    photos,
    user_id: user.id,
    is_active: isAlreadyClient,
    approved: isAlreadyClient,
  })

  if (error) {
    if (uploadedPaths.length > 0) await admin.storage.from('service-photos').remove(uploadedPaths)
    return { error: 'No se pudo crear el servicio. Intentá de nuevo.' }
  }

  redirect('/dashboard')
}

export type UpdateServiceState = { error: string | null }

export async function updateService(_state: UpdateServiceState, formData: FormData): Promise<UpdateServiceState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debés iniciar sesión' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'client') return { error: 'No tenés permiso para editar servicios' }

  const serviceId = formData.get('serviceId') as string
  if (!serviceId) return { error: 'Servicio no encontrado' }

  // Verify ownership server-side — never trust the route alone
  const { data: existing } = await supabase.from('services').select('user_id, photos').eq('id', serviceId).single()
  if (!existing || existing.user_id !== user.id) return { error: 'No tenés permiso para editar este servicio' }

  const result = await saveServiceEdits(supabase, existing, serviceId, formData)
  if (result.error) return result

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
