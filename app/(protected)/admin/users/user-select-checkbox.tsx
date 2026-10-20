'use client'

import { useUsersSelection } from './users-selection-context'

export function UserSelectCheckbox({ userId, email }: { userId: string; email: string }) {
  const { selected, toggle } = useUsersSelection()

  return (
    <input
      type="checkbox"
      checked={selected.has(userId)}
      onChange={() => toggle(userId)}
      aria-label={`Seleccionar ${email}`}
      className="size-4 cursor-pointer accent-celeste"
    />
  )
}
