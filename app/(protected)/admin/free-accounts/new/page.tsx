'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createFreeAccountInvite, type CreateInviteState } from '@/app/actions/free-accounts'
import InviteLinkResult from '@/components/invite-link-result'
import { AdminPageContainer } from '../../admin-page-container'

const initialState: CreateInviteState = { error: null }

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gris/40 text-sm focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste disabled:bg-gris/10'

const labelClass = 'block text-sm font-medium text-ink mb-1'

export default function NewFreeAccountInvitePage() {
  const [state, formAction, isPending] = useActionState(createFreeAccountInvite, initialState)
  const isCreated = Boolean(state?.success && state.link)

  return (
    <AdminPageContainer size="narrow">
      <Link href="/admin/free-accounts" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <span>←</span> Volver a cuentas gratuitas
      </Link>

      <h1 className="mt-4 font-brand uppercase text-2xl text-ink">Nueva invitación gratuita</h1>
      <p className="mt-1 text-sm text-muted">
        El link queda atado a este email y vence a los 7 días. Se descontinúa apenas se usa una vez.
      </p>

      <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gris/30 bg-white p-6">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email del invitado
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isCreated}
            className={inputClass}
            placeholder="amigo@email.com"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: '#FBEAE7', color: '#A63B24' }}>
            {state.error}
          </p>
        )}

        {isCreated && state.link && <InviteLinkResult link={state.link} />}

        <button
          type="submit"
          disabled={isPending || isCreated}
          className="w-full cursor-pointer rounded-full bg-celeste px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-celeste-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Creando...' : 'Crear invitación'}
        </button>

        {isCreated && (
          <Link
            href="/admin/free-accounts"
            className="block w-full rounded-full border border-celeste px-4 py-2.5 text-center text-sm font-semibold text-celeste-deep transition-colors hover:bg-celeste/10"
          >
            Volver
          </Link>
        )}
      </form>
    </AdminPageContainer>
  )
}
