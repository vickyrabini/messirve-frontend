'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentProfile } from '@/lib/profile'
import { createAdminClient } from '@/lib/supabase/admin'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type CreateUserState = { error: string | null; success?: boolean }

export async function createClientUser(_state: CreateUserState, formData: FormData): Promise<CreateUserState> {
  // Verify the CALLER is an admin — server-side, never trust the route gate alone
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') {
    return { error: 'No tenés permiso para crear usuarios' }
  }

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string)?.trim()

  if (!email || !password || !fullName) {
    return { error: 'Todos los campos son requeridos' }
  }
  if (!emailRegex.test(email)) {
    return { error: 'El formato del email es inválido' }
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const admin = createAdminClient()

  // 1. Create the auth user — fires handle_new_user, profile gets role default 'user'
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (createError || !created?.user) {
    console.log('[createClientUser] admin.createUser error:', {
      message: createError?.message,
      status: createError?.status,
      code: createError?.code,
      name: createError?.name,
    })
    if (createError?.message?.includes('already been registered')) {
      return { error: 'Este email ya está registrado' }
    }
    return { error: 'No se pudo crear el usuario. Intentá de nuevo.' }
  }

  // 2. Promote to 'client' — same service-role client bypasses RLS
  const { error: updateError } = await admin.from('profiles').update({ role: 'client' }).eq('id', created.user.id)

  if (updateError) {
    console.log('[createClientUser] profiles update error:', {
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      code: updateError.code,
    })
    // Roll back — don't leave an orphaned account stuck with the wrong role
    await admin.auth.admin.deleteUser(created.user.id)
    return { error: 'No se pudo asignar el rol de cliente. Operación revertida.' }
  }

  revalidatePath('/admin')
  return { error: null, success: true }
}

export type UpdateUserState = { error: string | null; success?: boolean }

const validRoles = ['admin', 'client', 'user'] as const
type Role = (typeof validRoles)[number]

export async function updateUser(_state: UpdateUserState, formData: FormData): Promise<UpdateUserState> {
  // Verify the CALLER is an admin — server-side, never trust the route gate alone
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') {
    return { error: 'No tenés permiso para editar usuarios' }
  }

  const userId = formData.get('userId') as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const role = formData.get('role') as string
  const password = (formData.get('password') as string)?.trim()

  if (!userId || !fullName || !role) {
    return { error: 'Todos los campos son requeridos' }
  }
  if (!validRoles.includes(role as Role)) {
    return { error: 'El rol seleccionado no es válido' }
  }
  if (password && password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const admin = createAdminClient()

  // 1. Fetch current metadata so we merge instead of overwrite — preserves any other keys it may carry
  const { data: existing, error: fetchError } = await admin.auth.admin.getUserById(userId)
  if (fetchError || !existing?.user) {
    return { error: 'No se pudo encontrar el usuario' }
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { ...existing.user.user_metadata, full_name: fullName },
    ...(password && { password }),
  })
  if (authError) {
    return { error: 'No se pudo actualizar el usuario. Intentá de nuevo.' }
  }

  // 2. Keep `profiles` in sync — it's the source of truth for role checks and getCurrentProfile()
  const { error: profileError } = await admin.from('profiles').update({ full_name: fullName, role }).eq('id', userId)
  if (profileError) {
    return { error: 'Se actualizó la cuenta, pero no se pudo guardar el perfil. Intentá de nuevo.' }
  }

  revalidatePath('/admin/users')
  return { error: null, success: true }
}

export async function toggleServiceActive(formData: FormData): Promise<void> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') return

  const serviceId = formData.get('serviceId') as string
  const isActive = formData.get('isActive') === 'true'
  if (!serviceId) return

  const admin = createAdminClient()
  await admin.from('services').update({ is_active: !isActive }).eq('id', serviceId)

  revalidatePath('/admin/services')
}

export async function approveClientRequest(formData: FormData): Promise<void> {
  // Verify the CALLER is an admin — server-side, never trust the route gate alone
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') return

  const requestId = formData.get('requestId') as string
  const userId = formData.get('userId') as string
  if (!requestId || !userId) return

  const admin = createAdminClient()

  const { error } = await admin
    .from('client_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: caller.id })
    .eq('id', requestId)
  if (error) return

  await admin.from('profiles').update({ role: 'client' }).eq('id', userId)

  revalidatePath('/admin/requests')
}

export async function rejectClientRequest(formData: FormData): Promise<void> {
  // Verify the CALLER is an admin — server-side, never trust the route gate alone
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') return

  const requestId = formData.get('requestId') as string
  if (!requestId) return

  const admin = createAdminClient()
  await admin
    .from('client_requests')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: caller.id })
    .eq('id', requestId)

  revalidatePath('/admin/requests')
}
