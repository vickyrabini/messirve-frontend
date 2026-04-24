'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'

const initialState = { error: null }

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  if (state?.success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#E8F5FF' }}
        >
          <svg
            className="w-7 h-7"
            style={{ color: '#72B8E6' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email enviado</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Si ese email está registrado, recibirás un enlace para restablecer tu contraseña en los
          próximos minutos.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium hover:underline"
          style={{ color: '#72B8E6' }}
        >
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Recuperar contraseña</h2>
      <p className="text-sm text-gray-500 mb-6">
        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
      </p>

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
            placeholder="tu@email.com"
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
          {isPending ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
