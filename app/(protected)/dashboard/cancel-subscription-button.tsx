'use client'

import { useActionState, useState } from 'react'
import { cancelSubscription, type CancelState } from '@/app/actions/subscription'

const initialState: CancelState = { error: null }

export function CancelSubscriptionButton() {
  const [confirming, setConfirming] = useState(false)
  const [state, formAction, isPending] = useActionState(cancelSubscription, initialState)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-full border border-red-500 px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
      >
        Cancelar suscripción
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">{state.error}</p>}
      <p className="text-sm font-semibold text-ink">
        ¿Estás seguro? Se cancela tu suscripción de inmediato, se elimina tu servicio publicado junto con sus reseñas
        y likes, y tu cuenta pasa a ser un usuario normal — tus propios likes y comentarios en otros servicios se
        mantienen. No se puede deshacer.
      </p>
      <div className="flex gap-3">
        <form action={formAction}>
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
          >
            {isPending ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer rounded-full border border-gris/40 px-5 py-2.5 text-sm font-semibold text-muted hover:bg-gris/10"
        >
          No
        </button>
      </div>
    </div>
  )
}
