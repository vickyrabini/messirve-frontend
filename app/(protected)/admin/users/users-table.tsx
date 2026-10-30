import Link from 'next/link'
import { DeleteUserButton } from './delete-user-button'
import { PageSelectCheckbox } from './page-select-checkbox'
import { roleBadgeClass } from './roles'
import { UserSelectCheckbox } from './user-select-checkbox'
import type { AdminUserRow } from './users-export-columns'

type UsersTableProps = {
  users: AdminUserRow[]
  callerId: string | undefined
}

export function UsersTable({ users, callerId }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="w-10 px-5 py-3">
              <PageSelectCheckbox pageIds={users.map((u) => u.id)} />
            </th>
            {/* FULL_NAME_DISABLED: <th className="px-5 py-3 font-medium">Nombre</th> */}
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Rol</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const email = u.email ?? '—'
            return (
              <tr key={u.id} className="border-b border-gris/20 last:border-0">
                <td className="w-10 px-5 py-3">
                  <UserSelectCheckbox userId={u.id} email={email} />
                </td>
                {/* FULL_NAME_DISABLED: <td className="px-5 py-3 font-medium text-ink">{u.full_name ?? '—'}</td> */}
                <td className="px-5 py-3 font-medium text-ink">{email}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass[u.role] ?? roleBadgeClass.user}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                    >
                      Editar
                    </Link>
                    {u.role !== 'admin' && u.id !== callerId && (
                      <DeleteUserButton userId={u.id} /* FULL_NAME_DISABLED: name={u.full_name} */ name={null} email={email} />
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
