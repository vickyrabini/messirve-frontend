'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

const links = [
  {
    href: '/admin',
    label: 'Panel',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <rect x={3} y={3} width={8} height={8} rx={1.5} />
        <rect x={13} y={3} width={8} height={8} rx={1.5} />
        <rect x={3} y={13} width={8} height={8} rx={1.5} />
        <rect x={13} y={13} width={8} height={8} rx={1.5} />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Usuarios',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <circle cx={12} cy={8} r={4} />
        <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
  {
    href: '/admin/services',
    label: 'Servicios',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <rect x={4} y={4} width={16} height={16} rx={2} />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </svg>
    ),
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-[266px] shrink-0 flex-col bg-celeste-deep px-5 py-6">
      <Link href="/admin" className="self-start">
        <Image src="/messirve-logo.png" alt="Messirve" width={138} height={64} className="h-14 w-auto" />
      </Link>
      <span className="mt-2 text-[13px] font-semibold uppercase tracking-widest text-white/40">Admin</span>

      <nav className="mt-9 flex flex-col gap-1.5">
        {links.map((link) => {
          const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white/85'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-xl px-1.5 py-2.5 text-[14.5px] font-semibold text-white/55 transition-colors hover:text-white/85"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M10 8l-4 4 4 4" />
            <path d="M6 12h9" />
            <path d="M15 4h4v16h-4" />
          </svg>
          Volver al dashboard
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="mt-1.5 flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-1.5 py-2.5 text-[14.5px] font-semibold text-white/55 transition-colors hover:text-white/85"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M15 4h4v16h-4" />
              <path d="M10 8l-4 4 4 4" />
              <path d="M6 12h9" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
