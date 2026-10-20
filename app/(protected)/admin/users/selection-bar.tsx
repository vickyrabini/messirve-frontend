'use client'

import { useUsersSelection } from './users-selection-context'

export function SelectionBar() {
  const { count, clear } = useUsersSelection()

  if (count === 0) return null

  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-celeste/30 bg-celeste/10 px-4 py-2.5 text-sm text-celeste-deep">
      <span className="font-semibold">
        {count} {count === 1 ? 'seleccionado' : 'seleccionados'}
      </span>
      <button
        type="button"
        onClick={clear}
        className="cursor-pointer font-semibold text-muted transition-colors hover:text-ink"
      >
        Limpiar
      </button>
    </div>
  )
}
