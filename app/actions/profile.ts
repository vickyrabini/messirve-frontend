'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type UpdateProfileState = { error: string | null; success?: boolean }

export async function updateProfile(_state: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión' }
  }

  const fullName = (formData.get('fullName') as string)?.trim()
  if (!fullName) {
    return { error: 'El nombre es requerido' }
  }

  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
  if (error) {
    return { error: 'No se pudo actualizar el perfil. Intentá de nuevo.' }
  }

  revalidatePath('/dashboard')
  return { error: null, success: true }
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Deleting an auth user requires the service-role key — bypasses RLS, but we only
  // ever act on the caller's own id, taken from their own session above (never from input).
  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(user.id)

  await supabase.auth.signOut()
  redirect('/')
}
