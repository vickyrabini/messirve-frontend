'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Panel' },
  { href: '/admin/users', label: 'Usuarios' },
  { href: '/admin/services', label: 'Servicios' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gris/30 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-brand text-xl text-celeste">
            messirve <span className="text-sm text-muted">admin</span>
          </span>

          <div className="flex items-center gap-4">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive ? 'text-sm font-semibold text-celeste-deep' : 'text-sm text-muted transition-colors hover:text-ink'
                  }
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        <Link href="/dashboard" className="text-sm text-muted transition-colors hover:text-ink">
          ← Volver al dashboard
        </Link>
      </div>
    </nav>
  )
}
