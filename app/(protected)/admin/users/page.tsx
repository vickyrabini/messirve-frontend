import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Pagination } from '@/components/pagination'
import { AdminListFilters } from '@/components/admin-list-filters'
import { escapeLike } from '@/lib/escape-like'
import { getCurrentProfile } from '@/lib/profile'
import { ExportMenu } from './export-menu'
import { ROLES, ROLE_LABEL, isRole } from './roles'
import { SelectionBar } from './selection-bar'
import { ADMIN_USER_ROW_COLUMNS, type AdminUserRow } from './users-export-columns'
import { UsersTable } from './users-table'

const PAGE_SIZE = 10

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABEL[role] }))

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>
}) {
  const { q, role: roleParam, page: pageParam } = await searchParams
  const query = q?.trim() ?? ''
  const role = isRole(roleParam) ? roleParam : null
  const page = Math.max(1, Number(pageParam) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const caller = await getCurrentProfile()
  // La vista ya trae rol y email, así que filtro y paginación los resuelve la base.
  const admin = createAdminClient()
  let request = admin
    .from('admin_users_view')
    .select(ADMIN_USER_ROW_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  // FULL_NAME_DISABLED: la búsqueda por nombre quedó deshabilitada, solo email
  if (query) request = request.ilike('email', `%${escapeLike(query)}%`)
  if (role) request = request.eq('role', role)
  const { data, count } = await request.returns<AdminUserRow[]>()

  const users = data ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (role) params.set('role', role)
    params.set('page', String(p))
    return `/admin/users?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-brand uppercase text-2xl text-ink">Usuarios</h1>
          {/* FULL_NAME_DISABLED: <p className="mt-1 text-sm text-muted">Buscá, editá el rol, el nombre o la contraseña de cualquier usuario</p> */}
          <p className="mt-1 text-sm text-muted">Buscá, editá el rol o la contraseña de cualquier usuario</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportMenu filteredCount={total} role={role} q={query} />
          <Link
            href="/admin/users/new"
            className="rounded-full bg-celeste px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-celeste-dark"
          >
            + Nuevo usuario
          </Link>
        </div>
      </div>

      <AdminListFilters
        basePath="/admin/users"
        // FULL_NAME_DISABLED: searchPlaceholder="Buscar por nombre o email..."
        searchPlaceholder="Buscar por email..."
        selectParam="role"
        selectLabel="Filtrar por rol"
        selectAllLabel="Todos los roles"
        options={ROLE_OPTIONS}
        initialQuery={query}
        initialSelect={role}
      />

      <SelectionBar />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gris/30 bg-white">
        <UsersTable users={users} callerId={caller?.id} />

        {users.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No se encontraron usuarios</p>}

        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  )
}
