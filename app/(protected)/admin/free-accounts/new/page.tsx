'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createFreeAccountInvite, type CreateInviteState } from '@/app/actions/free-accounts'

const initialState: CreateInviteState = { error: null }

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gris/40 text-sm focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste'

const labelClass = 'block text-sm font-medium text-ink mb-1'

export default function NewFreeAccountInvitePage() {
  const [state, formAction, isPending] = useActionState(createFreeAccountInvite, initialState)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!state?.link) return
    await navigator.clipboard.writeText(state.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-md px-8 py-10">
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
            className={inputClass}
            placeholder="amigo@email.com"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: '#FBEAE7', color: '#A63B24' }}>
            {state.error}
          </p>
        )}

        {state?.success && state.link && (
          <div className="space-y-2 rounded-lg bg-celeste/10 px-3 py-3">
            <p className="text-sm font-semibold text-celeste-deep">Invitación creada. Mandale este link:</p>
            <div className="flex items-center gap-2">
              <input readOnly value={state.link} className="w-full truncate rounded-lg border border-gris/40 bg-white px-3 py-2 text-xs" />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 cursor-pointer rounded-lg border border-celeste px-3 py-2 text-xs font-semibold text-celeste-deep transition-colors hover:bg-celeste/10"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer rounded-full bg-celeste px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-celeste-dark disabled:opacity-60"
        >
          {isPending ? 'Creando...' : 'Crear invitación'}
        </button>
      </form>
    </div>
  )
}
