'use client'

import { useActionState } from 'react'
import { createCheckoutSession, type CheckoutState } from '@/app/actions/subscription'
import { SunDecor } from '@/components/sun-decor'

type Props = {
  checkoutStatus: 'success' | 'cancel' | null
}

const initialState: CheckoutState = { error: null }

export function SubscribeCard({ checkoutStatus }: Props) {
  const [state, formAction, isPending] = useActionState(createCheckoutSession, initialState)

  return (
    <div className="relative mb-8 h-full">
      <SunDecor className="pointer-events-none absolute -bottom-24 right-0 h-[420px] w-[420px] opacity-10" />
      <div className="max-w-2xl">
        <div className="relative rounded-[20px] border border-gris/30 bg-white px-8 py-12 text-center sm:px-10">
          <SunDecor className="mx-auto mb-5 h-16 w-16" />
          <p className="mx-auto max-w-[420px] text-[17px] leading-relaxed text-muted">
            Sumate como emprendedor para aparecer en búsquedas y gestionar tu suscripción acá.
          </p>

          <form action={formAction} className="mx-auto mt-6 max-w-[420px] space-y-3 text-center">
            {checkoutStatus === 'cancel' && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">
                Pago cancelado. Podés intentarlo de nuevo cuando quieras.
              </p>
            )}
            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-full bg-dorado px-8 py-4 font-brand text-[15px] uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-dorado-light disabled:opacity-60"
            >
              {isPending ? 'Redirigiendo...' : 'Suscribirme'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
