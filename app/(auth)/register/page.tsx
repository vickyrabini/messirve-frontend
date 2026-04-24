'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

const initialState = { error: null }

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Revisa tu email!</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Te enviamos un enlace de confirmación. Haz clic en él para activar tu cuenta y empezar a
          usar messirve.
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Crear cuenta</h2>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            placeholder="Juan García"
          />
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
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

        {state?.error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 text-white font-medium rounded-lg transition-opacity disabled:opacity-60 text-sm cursor-pointer"
          style={{ backgroundColor: '#72B8E6' }}
        >
          {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium hover:underline" style={{ color: '#72B8E6' }}>
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
