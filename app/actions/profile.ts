'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { deleteOwnedService } from '@/lib/delete-owned-service'

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

export type DeleteAccountState = { error: string | null }

export async function deleteAccount(_state: DeleteAccountState, _formData: FormData): Promise<DeleteAccountState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  // Deleting an auth user requires the service-role key — bypasses RLS, but we only
  // ever act on the caller's own id, taken from their own session above (never from input).
  const admin = createAdminClient()

  if (profile?.role === 'client') {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (subscription?.stripe_subscription_id) {
      try {
        await getStripe().subscriptions.cancel(subscription.stripe_subscription_id)
      } catch (err) {
        const stripeError = err as { message?: string; type?: string; code?: string }
        console.log('[deleteAccount] Stripe cancel error:', {
          message: stripeError?.message,
          type: stripeError?.type,
          code: stripeError?.code,
        })
        return { error: 'No se pudo cancelar tu suscripción. Intentá de nuevo.' }
      }
    }
  }

  try {
    await deleteOwnedService(admin, user.id)
  } catch (err) {
    console.log('[deleteAccount] cleanup error:', { message: (err as Error)?.message })
    return { error: 'No se pudo eliminar tu servicio. Intentá de nuevo.' }
  }

  await admin.auth.admin.deleteUser(user.id)

  await supabase.auth.signOut()
  redirect('/')
}
