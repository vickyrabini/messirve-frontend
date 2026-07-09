'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createClientUser, type CreateUserState } from '@/app/actions/admin'

const initialState: CreateUserState = { error: null }

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gris/40 text-sm focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste'

const labelClass = 'block text-sm font-medium text-ink mb-1'

export default function NewClientUserPage() {
  const [state, formAction, isPending] = useActionState(createClientUser, initialState)

  return (
    <div className="mx-auto max-w-md px-8 py-10">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <span>←</span> Volver a usuarios
      </Link>

      <h1 className="mt-4 font-brand uppercase text-2xl text-ink">Crear usuario cliente</h1>
      <p className="mt-1 text-sm text-muted">
        La cuenta queda lista para iniciar sesión de inmediato, con permiso para publicar servicios.
      </p>

      <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gris/30 bg-white p-6">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Nombre completo
            </label>
            <input id="fullName" name="fullName" type="text" required className={inputClass} placeholder="Nombre y apellido" />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              placeholder="cliente@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Contraseña provisoria
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: '#FBEAE7', color: '#A63B24' }}>
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="rounded-lg bg-celeste/10 px-3 py-2 text-sm font-semibold text-celeste-deep">
              Usuario creado correctamente. Ya puede iniciar sesión.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full cursor-pointer rounded-full bg-celeste px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-celeste-dark disabled:opacity-60"
          >
            {isPending ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
    </div>
  )
}
