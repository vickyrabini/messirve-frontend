'use client'

import { useRef, useState } from 'react'
import { downloadBlob } from '@/lib/download-blob'
import { useUsersSelection } from './users-selection-context'

const FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' }
] as const

type ExportFormat = (typeof FORMATS)[number]['value']

type ExportMenuProps = {
  filteredCount: number
  role: string | null
  q: string
}

const itemClass = 'block w-full rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-cream'
const disabledClass = 'pointer-events-none opacity-40'

export function ExportMenu({ filteredCount, role, q }: ExportMenuProps) {
  const { selected, count } = useUsersSelection()
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const filteredHref = (format: ExportFormat) => {
    const params = new URLSearchParams({ format })
    if (role) params.set('role', role)
    if (q) params.set('q', q)
    return `/admin/users/export?${params.toString()}`
  }

  const exportSelected = async (format: ExportFormat) => {
    setError(null)
    setExporting(true)
    try {
      const response = await fetch('/admin/users/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, ids: [...selected] })
      })
      if (!response.ok) throw new Error('export failed')
      downloadBlob(await response.blob(), `usuarios-${new Date().toISOString().slice(0, 10)}.${format}`)
      if (detailsRef.current) detailsRef.current.open = false
    } catch {
      setError('No se pudo exportar. Probá de nuevo.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary className="cursor-pointer list-none rounded-full border border-gris/40 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep">
        Exportar
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-gris/30 bg-white p-2 shadow-soft">
        <p className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">Filtrados ({filteredCount})</p>
        {FORMATS.map((format) => (
          <a
            key={format.value}
            href={filteredHref(format.value)}
            download
            className={`${itemClass} ${filteredCount === 0 ? disabledClass : ''}`}
          >
            {format.label}
          </a>
        ))}
        <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">Seleccionados ({count})</p>
        {FORMATS.map((format) => (
          <button
            key={format.value}
            type="button"
            disabled={count === 0 || exporting}
            onClick={() => exportSelected(format.value)}
            className={`${itemClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {format.label}
          </button>
        ))}
        {error && <p className="px-3 py-2 text-xs text-red-500">{error}</p>}
      </div>
    </details>
  )
}
