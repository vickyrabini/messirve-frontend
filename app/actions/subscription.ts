'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export type CheckoutState = { error: string | null }

export async function createCheckoutSession(_state: CheckoutState, _formData: FormData): Promise<CheckoutState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión' }
  }

  // Defense in depth — verify role server-side, never trust the dashboard gate alone
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'user') {
    return { error: 'No podés iniciar este proceso' }
  }

  // Re-subscribing after a prior cancellation reuses the same Stripe customer
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const priceId = process.env.STRIPE_PRICE_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!priceId || !siteUrl) {
    console.log('[createCheckoutSession] missing config:', { hasPriceId: !!priceId, hasSiteUrl: !!siteUrl })
    return { error: 'No se pudo iniciar el pago. Intentá de nuevo.' }
  }

  let session
  try {
    session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      ...(existingSubscription
        ? { customer: existingSubscription.stripe_customer_id }
        : { customer_email: user.email }),
      success_url: `${siteUrl}/dashboard?tab=suscripcion&checkout=success`,
      cancel_url: `${siteUrl}/dashboard?tab=suscripcion&checkout=cancel`,
    })
  } catch (err) {
    const stripeError = err as { message?: string; type?: string; code?: string }
    console.log('[createCheckoutSession] Stripe error:', {
      message: stripeError?.message,
      type: stripeError?.type,
      code: stripeError?.code,
    })
    return { error: 'No se pudo iniciar el pago. Intentá de nuevo.' }
  }

  if (!session.url) {
    return { error: 'No se pudo iniciar el pago. Intentá de nuevo.' }
  }

  redirect(session.url)
}

export type CancelState = { error: string | null }

export async function cancelSubscription(_state: CancelState, _formData: FormData): Promise<CancelState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión' }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'client') {
    return { error: 'No podés cancelar la suscripción' }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!subscription?.stripe_subscription_id) {
    return { error: 'No se encontró una suscripción activa para cancelar.' }
  }

  try {
    await getStripe().subscriptions.cancel(subscription.stripe_subscription_id)
  } catch (err) {
    const stripeError = err as { message?: string; type?: string; code?: string }
    console.log('[cancelSubscription] Stripe error:', {
      message: stripeError?.message,
      type: stripeError?.type,
      code: stripeError?.code,
    })
    return { error: 'No se pudo cancelar la suscripción. Intentá de nuevo.' }
  }

  redirect('/dashboard?tab=suscripcion&cancellation=success')
}

export type UpdatePaymentMethodState = { error: string | null }

export async function updatePaymentMethod(
  _state: UpdatePaymentMethodState,
  _formData: FormData
): Promise<UpdatePaymentMethodState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión' }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'client') {
    return { error: 'No podés actualizar el método de pago' }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, currency')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!subscription?.stripe_customer_id) {
    return { error: 'No se encontró tu suscripción.' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    return { error: 'No se pudo iniciar el proceso. Intentá de nuevo.' }
  }

  let session
  try {
    session = await getStripe().checkout.sessions.create({
      mode: 'setup',
      customer: subscription.stripe_customer_id,
      // Required by Stripe in setup mode when payment_method_types isn't set explicitly
      currency: subscription.currency ?? 'eur',
      client_reference_id: user.id,
      success_url: `${siteUrl}/dashboard?tab=suscripcion&paymentUpdate=success`,
      cancel_url: `${siteUrl}/dashboard?tab=suscripcion&paymentUpdate=cancel`,
    })
  } catch (err) {
    const stripeError = err as { message?: string; type?: string; code?: string }
    console.log('[updatePaymentMethod] Stripe error:', {
      message: stripeError?.message,
      type: stripeError?.type,
      code: stripeError?.code,
    })
    return { error: 'No se pudo iniciar el proceso. Intentá de nuevo.' }
  }

  if (!session.url) {
    return { error: 'No se pudo iniciar el proceso. Intentá de nuevo.' }
  }

  redirect(session.url)
}
