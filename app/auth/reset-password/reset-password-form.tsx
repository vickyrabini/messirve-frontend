'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/actions/auth'

const initialState = { error: null }

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <form action={formAction} noValidate className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold text-ink">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-[14px] font-semibold text-ink">
          Repetí la contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Repetí la contraseña"
          className="w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20"
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-celeste-deep px-6 py-3.5 text-[16px] font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
      >
        {isPending ? 'Guardando...' : 'Guardar y entrar'}
      </button>
    </form>
  )
}
