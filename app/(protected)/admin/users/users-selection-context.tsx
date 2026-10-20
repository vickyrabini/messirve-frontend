'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type UsersSelection = {
  selected: ReadonlySet<string>
  count: number
  toggle: (id: string) => void
  setMany: (ids: string[], checked: boolean) => void
  clear: () => void
}

const UsersSelectionContext = createContext<UsersSelection | null>(null)

export function UsersSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }, [])

  const setMany = useCallback((ids: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])

  const value = useMemo(
    () => ({ selected, count: selected.size, toggle, setMany, clear }),
    [selected, toggle, setMany, clear]
  )

  return <UsersSelectionContext.Provider value={value}>{children}</UsersSelectionContext.Provider>
}

export function useUsersSelection() {
  const context = useContext(UsersSelectionContext)
  if (!context) throw new Error('useUsersSelection debe usarse dentro de UsersSelectionProvider')
  return context
}
