import Link from 'next/link'

export function Pagination({ page, totalPages, buildHref }: { page: number; totalPages: number; buildHref: (page: number) => string }) {
  if (totalPages <= 1) return null

  const navClass = (disabled: boolean) =>
    `rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold transition-colors ${
      disabled ? 'pointer-events-none opacity-40' : 'text-ink hover:border-celeste hover:text-celeste-deep'
    }`

  return (
    <div className="flex items-center justify-between border-t border-gris/20 px-5 py-3 text-sm">
      <Link href={buildHref(page - 1)} aria-disabled={page <= 1} className={navClass(page <= 1)}>
        ← Anterior
      </Link>
      <span className="text-muted">
        Página {page} de {totalPages}
      </span>
      <Link href={buildHref(page + 1)} aria-disabled={page >= totalPages} className={navClass(page >= totalPages)}>
        Siguiente →
      </Link>
    </div>
  )
}
