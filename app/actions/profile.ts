'use server'

import { redirect } from 'next/navigation'
// FULL_NAME_DISABLED: solo lo usaba updateProfile
// import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteUserAccount, type DeleteUserAccountFailure } from '@/lib/delete-user-account'

// FULL_NAME_DISABLED: el cliente pidió quitar el nombre (2026-10-16). El perfil solo editaba full_name.
// export type UpdateProfileState = { error: string | null; success?: boolean }
//
// export async function updateProfile(_state: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
//   const supabase = await createClient()
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()
//
//   if (!user) {
//     return { error: 'Debés iniciar sesión' }
//   }
//
//   const fullName = (formData.get('fullName') as string)?.trim()
//   if (!fullName) {
//     return { error: 'El nombre es requerido' }
//   }
//
//   const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
//   if (error) {
//     return { error: 'No se pudo actualizar el perfil. Intentá de nuevo.' }
//   }
//
//   revalidatePath('/dashboard')
//   return { error: null, success: true }
// }

export type DeleteAccountState = { error: string | null }

const deleteAccountErrors: Record<DeleteUserAccountFailure, string> = {
  subscription: 'No se pudo cancelar tu suscripción. Intentá de nuevo.',
  service: 'No se pudo eliminar tu servicio. Intentá de nuevo.',
  invites: 'No se pudo eliminar tu cuenta. Intentá de nuevo.',
  account: 'No se pudo eliminar tu cuenta. Intentá de nuevo.',
}

export async function deleteAccount(_state: DeleteAccountState, _formData: FormData): Promise<DeleteAccountState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Deleting an auth user requires the service-role key — bypasses RLS, but we only
  // ever act on the caller's own id, taken from their own session above (never from input).
  const failure = await deleteUserAccount(createAdminClient(), user.id)
  if (failure) {
    return { error: deleteAccountErrors[failure] }
  }

  await supabase.auth.signOut()
  redirect('/')
}
