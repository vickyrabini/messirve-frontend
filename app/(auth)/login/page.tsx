'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

const initialState = { error: null }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar sesión</h2>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#72B8E6' } as React.CSSProperties}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            placeholder="••••••••"
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
          {isPending ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-sm hover:underline"
          style={{ color: '#72B8E6' }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-medium hover:underline" style={{ color: '#72B8E6' }}>
          Regístrate
        </Link>
      </p>
    </div>
  )
}
