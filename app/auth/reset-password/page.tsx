'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/actions/auth'

const initialState = { error: null }

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#72B8E6' }}>
            messirve
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Tu comunidad latina en Barcelona</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nueva contraseña</h2>
          <p className="text-sm text-gray-500 mb-6">Elige una nueva contraseña para tu cuenta.</p>

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                placeholder="Repite la contraseña"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 text-white font-medium rounded-lg transition-opacity disabled:opacity-60 text-sm cursor-pointer"
              style={{ backgroundColor: '#72B8E6' }}
            >
              {isPending ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
