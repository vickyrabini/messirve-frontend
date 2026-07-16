'use client'

import { useActionState } from 'react'
import { updatePaymentMethod, type UpdatePaymentMethodState } from '@/app/actions/subscription'

const initialState: UpdatePaymentMethodState = { error: null }

export function UpdatePaymentMethodButton() {
  const [state, formAction, isPending] = useActionState(updatePaymentMethod, initialState)

  return (
    <form action={formAction}>
      {state.error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-full bg-celeste px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-celeste-dark disabled:opacity-60"
      >
        {isPending ? 'Redirigiendo...' : 'Actualizar método de pago'}
      </button>
    </form>
  )
}
