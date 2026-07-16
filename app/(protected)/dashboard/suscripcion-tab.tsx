import Link from 'next/link'
import { SubscribeCard } from './subscribe-card'
import { CheckoutSuccessBanner } from './checkout-success-banner'
import { CancelSubscriptionButton } from './cancel-subscription-button'
import { UpdatePaymentMethodButton } from './update-payment-method-button'
import { DismissibleStatusBanner } from './dismissible-status-banner'
import { SunDecor } from '@/components/sun-decor'
import { Banner } from '@/components/banner'
import type { SubscriptionStatus } from '@/types/database'

type Props = {
  role: 'admin' | 'client' | 'user'
  ownService: { id: string; name: string; is_active: boolean; suspended_for_nonpayment: boolean } | null
  checkoutStatus: 'success' | 'cancel' | null
  paymentUpdateStatus: 'success' | 'cancel' | null
  cancellationStatus: 'success' | null
  subscription: {
    amount: number | null
    currency: string | null
    current_period_end: string | null
    status: SubscriptionStatus | null
  } | null
}

export function SuscripcionTab({
  role,
  ownService,
  checkoutStatus,
  paymentUpdateStatus,
  cancellationStatus,
  subscription,
}: Props) {
  return (
    <div>
      <CheckoutSuccessBanner status={checkoutStatus} />
      <DismissibleStatusBanner show={paymentUpdateStatus === 'success'} variant="gold">
        Método de pago actualizado. Estamos reintentando el cobro pendiente, esto puede tardar unos segundos —
        actualizá la página en un momento.
      </DismissibleStatusBanner>
      <DismissibleStatusBanner show={paymentUpdateStatus === 'cancel'} variant="error">
        No se actualizó el método de pago. Podés intentarlo de nuevo.
      </DismissibleStatusBanner>
      <DismissibleStatusBanner show={cancellationStatus === 'success'} variant="gold">
        Tu suscripción fue cancelada. Volviste a tu cuenta como usuario.
      </DismissibleStatusBanner>

      {role === 'client' && (
        <div className="mb-6 max-w-2xl rounded-[20px] border border-gris/40 bg-white p-8">
          <p className="font-brand text-2xl uppercase text-ink">Mi suscripción</p>
          {(subscription?.status === 'past_due' || subscription?.status === 'unpaid') && (
            <div className="mt-3 space-y-3">
              <Banner variant="error">
                Tu último pago falló. Tu servicio está deshabilitado y no aparece en búsquedas hasta que se
                regularice el pago.
              </Banner>
              <UpdatePaymentMethodButton />
            </div>
          )}
          {subscription?.amount != null && subscription.currency && (
            <p className="mt-2 text-[15px] text-muted">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: subscription.currency.toUpperCase() }).format(
                subscription.amount / 100
              )}{' '}
              / mes
            </p>
          )}
          {subscription?.current_period_end && (
            <p className="text-[15px] text-muted">
              Próxima renovación:{' '}
              {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          <div className="mt-6">
            <CancelSubscriptionButton />
          </div>
        </div>
      )}

      {role === 'client' && !ownService && (
        <div className="relative">
          <SunDecor className="pointer-events-none absolute -bottom-24 right-0 h-[420px] w-[420px] opacity-10" />
          <div className="max-w-2xl">
            <div className="relative rounded-[20px] border border-gris/40 bg-white px-8 py-12 text-center sm:px-10">
              <SunDecor className="mx-auto mb-5 h-16 w-16" />
              <p className="mx-auto max-w-[420px] text-[17px] leading-relaxed text-muted">
                Todavía no tenés un servicio publicado. Sumate como emprendedor para aparecer en búsquedas y
                gestionar tu suscripción acá.
              </p>
              <Link
                href="/dashboard/services/new"
                className="mt-6 inline-flex items-center rounded-full bg-dorado px-8 py-4 font-brand text-[15px] uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-dorado-light"
              >
                Sumate como emprendedor
              </Link>
            </div>
          </div>
        </div>
      )}

      {role === 'client' && ownService && (
        <div className="max-w-2xl">
          <div className="rounded-[20px] border border-gris/40 bg-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-brand text-2xl uppercase text-ink">Mi servicio</p>
                <p className="mt-1 text-[15px] text-muted">{ownService.name}</p>
              </div>
              <span
                className={`rounded-full px-4 py-1.5 text-[13.5px] font-semibold ${
                  ownService.suspended_for_nonpayment
                    ? 'bg-red-50 text-red-500'
                    : ownService.is_active
                      ? 'bg-[#E7F1E9] text-[#2E7D46]'
                      : 'bg-dorado/15 text-dorado-dark'
                }`}
              >
                {ownService.suspended_for_nonpayment
                  ? 'Pago pendiente'
                  : ownService.is_active
                    ? 'Publicado'
                    : 'Desactivado'}
              </span>
            </div>

            <Link
              href={`/dashboard/services/${ownService.id}/edit`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-celeste px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-celeste-dark"
            >
              Editar mi servicio
            </Link>
          </div>
        </div>
      )}

      {role !== 'client' && <SubscribeCard checkoutStatus={checkoutStatus} />}
    </div>
  )
}
