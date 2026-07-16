import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SubscriptionStatus } from '@/types/database'

const FULL_CLEANUP_STATUSES: SubscriptionStatus[] = ['canceled']
const SUSPEND_STATUSES: SubscriptionStatus[] = ['past_due', 'unpaid']

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.log('[stripe webhook] missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.log('[stripe webhook] signature verification failed:', { message: (err as Error)?.message })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'setup') {
          const userId = session.client_reference_id
          const customerId = session.customer as string | null
          const setupIntentId = session.setup_intent as string | null

          if (!userId || !customerId || !setupIntentId) {
            console.log('[stripe webhook] checkout.session.completed (setup) missing data', {
              userId,
              customerId,
              setupIntentId,
            })
            break
          }

          const stripe = getStripe()
          const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
          const paymentMethodId = setupIntent.payment_method as string | null
          if (!paymentMethodId) {
            console.log('[stripe webhook] setup intent has no payment_method', { setupIntentId })
            break
          }

          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
          })

          const { data: existingSubscription } = await admin
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('user_id', userId)
            .maybeSingle()

          if (existingSubscription?.stripe_subscription_id) {
            await stripe.subscriptions.update(existingSubscription.stripe_subscription_id, {
              default_payment_method: paymentMethodId,
            })

            const fullSubscription = await stripe.subscriptions.retrieve(existingSubscription.stripe_subscription_id, {
              expand: ['latest_invoice'],
            })
            const latestInvoice = fullSubscription.latest_invoice
            if (latestInvoice && typeof latestInvoice !== 'string' && latestInvoice.status === 'open') {
              try {
                await stripe.invoices.pay(latestInvoice.id!)
              } catch (err) {
                console.log('[stripe webhook] invoice retry failed:', { message: (err as Error)?.message })
              }
            }
          }
          break
        }

        const userId = session.metadata?.supabase_user_id ?? session.client_reference_id
        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null

        if (!userId || !customerId) {
          console.log('[stripe webhook] checkout.session.completed missing userId/customerId', { userId, customerId })
          break
        }

        let amount: number | null = null
        let currency: string | null = null
        let currentPeriodEnd: string | null = null
        if (subscriptionId) {
          try {
            const fullSubscription = await getStripe().subscriptions.retrieve(subscriptionId)
            amount = fullSubscription.items.data[0]?.price?.unit_amount ?? null
            currency = fullSubscription.items.data[0]?.price?.currency ?? null
            currentPeriodEnd = fullSubscription.items.data[0]?.current_period_end
              ? new Date(fullSubscription.items.data[0].current_period_end * 1000).toISOString()
              : null
          } catch (err) {
            console.log('[stripe webhook] failed to retrieve subscription for price info:', { message: (err as Error)?.message })
          }
        }

        const { error: upsertError } = await admin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            amount,
            currency,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        if (upsertError) throw upsertError

        const { error: roleError } = await admin.from('profiles').update({ role: 'client' }).eq('id', userId)
        if (roleError) throw roleError
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        let userId = subscription.metadata?.supabase_user_id ?? null

        if (!userId) {
          const { data: existing } = await admin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle()
          userId = existing?.user_id ?? null
        }

        if (!userId) {
          console.log('[stripe webhook] could not resolve userId for subscription event', { customerId, type: event.type })
          break
        }

        const status: SubscriptionStatus =
          event.type === 'customer.subscription.deleted' ? 'canceled' : (subscription.status as SubscriptionStatus)

        const { error: upsertError } = await admin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status,
            current_period_end: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
              : null,
            amount: subscription.items.data[0]?.price?.unit_amount ?? null,
            currency: subscription.items.data[0]?.price?.currency ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        if (upsertError) throw upsertError

        if (FULL_CLEANUP_STATUSES.includes(status)) {
          const { data: ownedService } = await admin
            .from('services')
            .select('id, photos')
            .eq('user_id', userId)
            .maybeSingle()

          if (ownedService) {
            const { error: commentsError } = await admin.from('service_comments').delete().eq('service_id', ownedService.id)
            if (commentsError) throw commentsError

            const { error: ratingsError } = await admin.from('service_ratings').delete().eq('service_id', ownedService.id)
            if (ratingsError) throw ratingsError

            const { error: likesError } = await admin.from('service_likes').delete().eq('service_id', ownedService.id)
            if (likesError) throw likesError

            const photos = (ownedService.photos as string[]) ?? []
            if (photos.length > 0) {
              const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-photos/`
              const paths = photos.filter((url) => url.startsWith(storageBase)).map((url) => url.slice(storageBase.length))
              if (paths.length > 0) {
                const { error: storageError } = await admin.storage.from('service-photos').remove(paths)
                if (storageError) {
                  console.log('[stripe webhook] failed to remove service photos:', {
                    message: storageError.message,
                    serviceId: ownedService.id,
                  })
                }
              }
            }

            const { error: deleteServiceError } = await admin.from('services').delete().eq('id', ownedService.id)
            if (deleteServiceError) throw deleteServiceError
          }

          const { error: roleError } = await admin.from('profiles').update({ role: 'user' }).eq('id', userId)
          if (roleError) throw roleError
        } else if (SUSPEND_STATUSES.includes(status)) {
          const { data: ownedService } = await admin
            .from('services')
            .select('id, is_active')
            .eq('user_id', userId)
            .maybeSingle()

          if (ownedService?.is_active) {
            const { error } = await admin
              .from('services')
              .update({ is_active: false, suspended_for_nonpayment: true })
              .eq('id', ownedService.id)
            if (error) throw error
          }
        } else if (status === 'active') {
          const { data: ownedService } = await admin
            .from('services')
            .select('id, suspended_for_nonpayment')
            .eq('user_id', userId)
            .maybeSingle()

          if (ownedService?.suspended_for_nonpayment) {
            const { error } = await admin
              .from('services')
              .update({ is_active: true, suspended_for_nonpayment: false })
              .eq('id', ownedService.id)
            if (error) throw error
          }
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.log('[stripe webhook] handler error:', { message: (err as Error)?.message, type: event.type })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
