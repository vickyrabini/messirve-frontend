'use server'

import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type RegisterClientState = { error: string | null; success?: boolean }

export async function registerClient(_state: RegisterClientState, formData: FormData): Promise<RegisterClientState> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string).trim()

  if (!email || !password || !fullName) {
    return { error: 'Todos los campos de la cuenta son requeridos' }
  }
  if (!isValidEmail(email)) {
    return { error: 'El formato del email es inválido' }
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const categoryId = (formData.get('categoryId') as string)?.trim()
  const name = (formData.get('name') as string)?.trim()
  if (!categoryId || !name) {
    return { error: 'La categoría y el nombre del servicio son obligatorios' }
  }

  const description = (formData.get('description') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const city = (formData.get('city') as string)?.trim() || 'Barcelona'
  const priceInfo = (formData.get('priceInfo') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
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

  const supabase = await createClient()
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  if (signUpError) {
    console.log('[registerClient] supabase signUp error:', {
      message: signUpError.message,
      status: signUpError.status,
      code: signUpError.code,
      name: signUpError.name,
    })
    if (signUpError.message.includes('already registered')) {
      return { error: 'Este email ya está registrado' }
    }
    if (signUpError.message.toLowerCase().includes('rate limit') || signUpError.message.includes('over_email_send_rate_limit')) {
      return { error: 'Demasiados intentos de registro. Espera unos minutos e intenta de nuevo.' }
    }
    return { error: 'No se pudo completar el registro. Intentá de nuevo.' }
  }

  const newUserId = data.user?.id
  if (!newUserId) {
    return { error: 'No se pudo completar el registro. Intentá de nuevo.' }
  }

  // No hay sesión autenticada todavía (falta confirmar el email), así que el insert
  // del servicio no puede pasar por el cliente normal (RLS exige auth.uid() = user_id).
  // Usamos el cliente admin, igual que el resto de las operaciones privilegiadas del repo.
  const admin = createAdminClient()

  const photos: string[] = []
  if (photoFiles.length > 0) {
    const slug = toSlug(name)
    for (const file of photoFiles) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${slug}/${randomUUID()}.${ext}`

      const { error: uploadError } = await admin.storage.from('service-photos').upload(path, file, { contentType: file.type })
      if (uploadError) {
        await admin.auth.admin.deleteUser(newUserId)
        return { error: 'No se pudo subir una de las imágenes. Intentá de nuevo.' }
      }

      const { data: urlData } = admin.storage.from('service-photos').getPublicUrl(path)
      photos.push(urlData.publicUrl)
    }
  }

  const { error: insertError } = await admin.from('services').insert({
    category_id: categoryId,
    name,
    description,
    address,
    city,
    price_info: priceInfo,
    phone,
    website,
    instagram,
    photos,
    user_id: newUserId,
    is_active: false,
    approved: false,
  })

  if (insertError) {
    console.log('[registerClient] services insert error:', {
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
      code: insertError.code,
    })
    // No dejamos una cuenta huérfana sin servicio — revertimos el alta.
    await admin.auth.admin.deleteUser(newUserId)
    return { error: 'No se pudo crear el servicio. Intentá de nuevo.' }
  }

  return { error: null, success: true }
}
