'use client'

import Link from 'next/link'
import { logout } from '@/app/actions/auth'

type Props = {
  isAuthenticated: boolean
}

export function AuthNavActions({ isAuthenticated }: Props) {
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className="hidden sm:inline-flex items-center rounded-full bg-celeste px-5 py-2.5 text-[15px] font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-celeste-dark"
        >
          Mi cuenta
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-celeste-deep px-5 py-2.5 text-[15px] font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-[#15212F]"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="hidden sm:inline-flex items-center rounded-full bg-celeste px-5 py-2.5 text-[15px] font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-celeste-dark"
      >
        Ingresar
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center rounded-full bg-celeste-deep px-5 py-2.5 text-[15px] font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-[#15212F]"
      >
        Registrarse
      </Link>
    </div>
  )
}
