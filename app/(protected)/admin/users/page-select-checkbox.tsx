'use client'

import { useEffect, useRef } from 'react'
import { useUsersSelection } from './users-selection-context'

export function PageSelectCheckbox({ pageIds }: { pageIds: string[] }) {
  const { selected, setMany } = useUsersSelection()
  const ref = useRef<HTMLInputElement>(null)

  const selectedInPage = pageIds.filter((id) => selected.has(id)).length
  const allSelected = pageIds.length > 0 && selectedInPage === pageIds.length
  const partiallySelected = selectedInPage > 0 && !allSelected

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = partiallySelected
  }, [partiallySelected])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      disabled={pageIds.length === 0}
      onChange={() => setMany(pageIds, !allSelected)}
      aria-label="Seleccionar todos los usuarios de la página"
      className="size-4 cursor-pointer accent-celeste"
    />
  )
}
