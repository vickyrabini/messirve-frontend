import type { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { deleteOwnedService } from '@/lib/delete-owned-service'

export type DeleteUserAccountFailure = 'subscription' | 'service' | 'invites' | 'account'

const CANCELABLE_STATUSES = ['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete']

// Compartido entre "Eliminar mi cuenta" (el propio usuario) y el borrado desde el admin.
// Devuelve el paso que falló (o null si salió todo bien) para que cada llamador arme su
// propio mensaje. Likes, ratings, comentarios, perfil y suscripción se van solos por
// `on delete cascade`; el servicio no (queda con user_id = null), por eso deleteOwnedService.
export async function deleteUserAccount(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<DeleteUserAccountFailure | null> {
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', userId)
    .maybeSingle()

  if (subscription?.stripe_subscription_id && CANCELABLE_STATUSES.includes(subscription.status)) {
    try {
      await getStripe().subscriptions.cancel(subscription.stripe_subscription_id)
    } catch (err) {
      const stripeError = err as { message?: string; type?: string; code?: string }
      console.log('[deleteUserAccount] Stripe cancel error:', {
        message: stripeError?.message,
        type: stripeError?.type,
        code: stripeError?.code,
      })
      return 'subscription'
    }
  }

  try {
    await deleteOwnedService(admin, userId)
  } catch (err) {
    console.log('[deleteUserAccount] service cleanup error:', { message: (err as Error)?.message })
    return 'service'
  }

  // client_invites.used_by / created_by referencian auth.users SIN `on delete` — si no
  // se borran antes, Postgres rechaza el deleteUser de cualquier cuenta gratuita o de un
  // admin que haya creado invitaciones.
  const { error: invitesError } = await admin
    .from('client_invites')
    .delete()
    .or(`used_by.eq.${userId},created_by.eq.${userId}`)
  if (invitesError) {
    console.log('[deleteUserAccount] invites cleanup error:', { message: invitesError.message })
    return 'invites'
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.log('[deleteUserAccount] deleteUser error:', { message: deleteError.message, status: deleteError.status })
    return 'account'
  }

  return null
}
