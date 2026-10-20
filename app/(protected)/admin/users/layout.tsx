import { UsersSelectionProvider } from './users-selection-context'

// El layout no se desmonta al cambiar ?page o los filtros: la selección sobrevive a ambos.
export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return <UsersSelectionProvider>{children}</UsersSelectionProvider>
}
