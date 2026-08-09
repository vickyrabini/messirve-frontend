'use server'

import { randomBytes, randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { getCurrentProfile } from '@/lib/profile'
import { createAdminClient } from '@/lib/supabase/admin'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_FILE_SIZE = 5 * 1024 * 1024

function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

// La extensión sale de un mapeo fijo por MIME type, nunca del nombre de archivo que
// manda el cliente (falseable) — cierra la vía de subir bytes arbitrarios con una
// extensión engañosa al bucket público service-photos.
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─────────────────────────────────────────────────────────────
// Admin: crear / revocar invitaciones, pasar cuenta gratuita a paga
// ─────────────────────────────────────────────────────────────

export type CreateInviteState = { error: string | null; success?: boolean; link?: string }

export async function createFreeAccountInvite(_state: CreateInviteState, formData: FormData): Promise<CreateInviteState> {
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') {
    return { error: 'No tenés permiso para crear invitaciones' }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email || !isValidEmail(email)) {
    return { error: 'El formato del email es inválido' }
  }

  const admin = createAdminClient()
  const token = randomBytes(32).toString('hex')

  const { error } = await admin.from('client_invites').insert({
    email,
    token,
    created_by: caller.id,
    expires_at: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
  })

  if (error) {
    console.log('[createFreeAccountInvite] insert error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    return { error: 'No se pudo crear la invitación. Intentá de nuevo.' }
  }

  revalidatePath('/admin/free-accounts')
  return { error: null, success: true, link: `${process.env.NEXT_PUBLIC_SITE_URL}/registro-gratis/${token}` }
}

export async function revokeInvite(formData: FormData): Promise<void> {
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') return

  const inviteId = formData.get('inviteId') as string
  if (!inviteId) return

  const admin = createAdminClient()
  await admin.from('client_invites').update({ status: 'revoked' }).eq('id', inviteId).eq('status', 'pending')

  revalidatePath('/admin/free-accounts')
}

export async function convertFreeAccountToPaid(formData: FormData): Promise<void> {
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') return

  const userId = formData.get('userId') as string
  if (!userId) return

  const admin = createAdminClient()

  // Reusa el estado "aprobado, esperando primer pago" que ya maneja suscripcion-tab.tsx
  // y el webhook de Stripe — no hace falta ningún código nuevo para que el cliente pague
  // y el servicio vuelva a aparecer. suspended_for_nonpayment queda intacto: ese flag es
  // exclusivo de fallos de cobro de Stripe, no de este downgrade manual.
  await admin.from('profiles').update({ role: 'user', account_type: 'paid' }).eq('id', userId)
  await admin.from('services').update({ is_active: false }).eq('user_id', userId)

  revalidatePath('/admin/free-accounts')
}

// ─────────────────────────────────────────────────────────────
// Registro público vía invitación
// ─────────────────────────────────────────────────────────────

export type RegisterFreeClientState = { error: string | null; success?: boolean }

export async function registerFreeClient(
  _state: RegisterFreeClientState,
  formData: FormData
): Promise<RegisterFreeClientState> {
  const token = (formData.get('token') as string)?.trim()
  if (!token) {
    return { error: 'Enlace de invitación inválido.' }
  }

  const admin = createAdminClient()

  const { data: invite } = await admin.from('client_invites').select('id, email, status, expires_at').eq('token', token).single()

  if (!invite || invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
    return { error: 'Este enlace ya no es válido. Pedile al admin que te genere uno nuevo.' }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string)?.trim()

  if (!email || !password || !fullName) {
    return { error: 'Todos los campos de la cuenta son requeridos' }
  }
  if (email !== invite.email) {
    return { error: 'Este enlace fue generado para otro email.' }
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

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (createError || !created?.user) {
    console.log('[registerFreeClient] createUser error:', {
      message: createError?.message,
      status: createError?.status,
      code: createError?.code,
    })
    if (createError?.message?.includes('already been registered')) {
      return { error: 'Este email ya está registrado' }
    }
    return { error: 'No se pudo completar el registro. Intentá de nuevo.' }
  }

  const newUserId = created.user.id

  const { error: profileError } = await admin
    .from('profiles')
    .update({ role: 'client', account_type: 'free' })
    .eq('id', newUserId)

  if (profileError) {
    await admin.auth.admin.deleteUser(newUserId)
    return { error: 'No se pudo activar la cuenta. Intentá de nuevo.' }
  }

  const photos: string[] = []
  if (photoFiles.length > 0) {
    const slug = toSlug(name)
    for (const file of photoFiles) {
      const ext = MIME_TO_EXT[file.type]
      if (!ext) {
        await admin.auth.admin.deleteUser(newUserId)
        return { error: 'Formato de imagen no soportado (usá JPG, PNG, WEBP o GIF)' }
      }
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

  // A diferencia de /register-client, acá el admin ya vetó a esta persona al mandarle
  // la invitación — el servicio queda aprobado y visible de entrada, sin revisión ni pago.
  const { error: insertError } = await admin.from('services').insert({
    category_id: categoryId,
    name,
    description,
    address,
    city,
    phone,
    website,
    instagram,
    photos,
    user_id: newUserId,
    is_active: true,
    approved: true,
  })

  if (insertError) {
    console.log('[registerFreeClient] services insert error:', {
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
      code: insertError.code,
    })
    await admin.auth.admin.deleteUser(newUserId)
    return { error: 'No se pudo crear el servicio. Intentá de nuevo.' }
  }

  await admin.from('client_invites').update({ status: 'used', used_by: newUserId, used_at: new Date().toISOString() }).eq('id', invite.id)

  return { error: null, success: true }
}
