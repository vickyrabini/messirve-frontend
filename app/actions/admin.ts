'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentProfile } from '@/lib/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteUserAccount, type DeleteUserAccountFailure } from '@/lib/delete-user-account'

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
  // FULL_NAME_DISABLED: el cliente pidió quitar el nombre (2026-10-16)
  // const fullName = (formData.get('fullName') as string)?.trim()

  // FULL_NAME_DISABLED: if (!email || !password || !fullName) {
  if (!email || !password) {
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
    // FULL_NAME_DISABLED: user_metadata: { full_name: fullName },
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
  // FULL_NAME_DISABLED: el cliente pidió quitar el nombre (2026-10-16)
  // const fullName = (formData.get('fullName') as string)?.trim()
  const role = formData.get('role') as string
  const password = (formData.get('password') as string)?.trim()

  // FULL_NAME_DISABLED: if (!userId || !fullName || !role) {
  if (!userId || !role) {
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

  // FULL_NAME_DISABLED: sin nombre, solo hay que tocar auth cuando cambia la contraseña.
  // const { error: authError } = await admin.auth.admin.updateUserById(userId, {
  //   user_metadata: { ...existing.user.user_metadata, full_name: fullName },
  //   ...(password && { password }),
  // })
  // if (authError) {
  //   return { error: 'No se pudo actualizar el usuario. Intentá de nuevo.' }
  // }
  if (password) {
    const { error: authError } = await admin.auth.admin.updateUserById(userId, { password })
    if (authError) {
      return { error: 'No se pudo actualizar el usuario. Intentá de nuevo.' }
    }
  }

  // 2. Keep `profiles` in sync — it's the source of truth for role checks and getCurrentProfile()
  // FULL_NAME_DISABLED: .update({ full_name: fullName, role })
  const { error: profileError } = await admin.from('profiles').update({ role }).eq('id', userId)
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

export async function approveService(formData: FormData): Promise<void> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') return

  const serviceId = formData.get('serviceId') as string
  if (!serviceId) return

  const admin = createAdminClient()
  // Solo marca `approved` — la visibilidad pública (`is_active`) recién se activa cuando el cliente paga.
  await admin.from('services').update({ approved: true }).eq('id', serviceId)

  revalidatePath('/admin/services')
}

export type DeleteUserState = { error: string | null; success?: boolean }

const deleteUserErrors: Record<DeleteUserAccountFailure, string> = {
  subscription: 'No se pudo cancelar la suscripción de Stripe del usuario. Intentá de nuevo.',
  service: 'No se pudo eliminar el servicio del usuario. Intentá de nuevo.',
  invites: 'No se pudieron eliminar las invitaciones del usuario. Intentá de nuevo.',
  account: 'No se pudo eliminar la cuenta. Intentá de nuevo.',
}

export async function deleteUserAsAdmin(_state: DeleteUserState, formData: FormData): Promise<DeleteUserState> {
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') {
    return { error: 'No tenés permiso para eliminar usuarios' }
  }

  const userId = formData.get('userId') as string
  if (!userId) {
    return { error: 'Usuario inválido' }
  }
  if (userId === caller.id) {
    return { error: 'No podés eliminar tu propia cuenta desde acá' }
  }

  const admin = createAdminClient()

  // Los admins no se borran desde la tabla — esta acción es para limpiar user/client de prueba.
  const { data: target } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle()
  if (target?.role === 'admin') {
    return { error: 'No se puede eliminar a otro administrador' }
  }

  const failure = await deleteUserAccount(admin, userId)
  if (failure) {
    return { error: deleteUserErrors[failure] }
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/free-accounts')
  return { error: null, success: true }
}
