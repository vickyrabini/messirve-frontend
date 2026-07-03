'use client'

import { useActionState, useState } from 'react'
import { requestClientRole, type ClientRequestState } from '@/app/actions/client-requests'
import type { ClientRequestStatus } from '@/types/database'

type Props = {
  request: { status: ClientRequestStatus; message: string | null } | null
}

const initialState: ClientRequestState = { error: null }

export function ClientRequestCard({ request }: Props) {
  const [state, formAction, isPending] = useActionState(requestClientRole, initialState)
  const [retrying, setRetrying] = useState(false)

  if (request?.status === 'pending') {
    return (
      <div className="mb-8 rounded-2xl border border-gris/30 bg-white p-8">
        <h3 className="font-brand text-lg text-ink">¿Querés ser cliente?</h3>
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-dorado/10 px-3 py-2 text-sm font-semibold text-dorado-dark">
          Tu solicitud está pendiente de revisión
        </p>
      </div>
    )
  }

  if (request?.status === 'rejected' && !retrying) {
    return (
      <div className="mb-8 rounded-2xl border border-gris/30 bg-white p-8">
        <h3 className="font-brand text-lg text-ink">¿Querés ser cliente?</h3>
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">
          Tu solicitud fue rechazada
        </p>
        <button
          type="button"
          onClick={() => setRetrying(true)}
          className="mt-4 cursor-pointer rounded-xl border border-gris/40 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
        >
          Volver a solicitar
        </button>
      </div>
    )
  }

  return (
    <div className="mb-8 rounded-2xl border border-gris/30 bg-white p-8">
      <h3 className="font-brand text-lg text-ink">¿Querés ser cliente?</h3>
      <p className="mt-1 text-sm text-muted">Publicá y gestioná tus propios servicios en Messirve</p>

      <form action={formAction} className="mt-4 space-y-3">
        <textarea
          name="message"
          rows={3}
          placeholder="Contanos sobre tu negocio (opcional)"
          className="w-full rounded-lg border border-gris/40 px-4 py-2.5 text-sm focus:border-celeste focus:outline-none focus:ring-2 focus:ring-celeste/30"
        />
        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-xl bg-celeste px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-celeste-dark disabled:opacity-60"
        >
          {isPending ? 'Enviando...' : 'Quiero ser cliente'}
        </button>
      </form>
    </div>
  )
}
