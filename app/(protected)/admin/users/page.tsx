import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Pagination } from '../pagination'

const PAGE_SIZE = 10

type UserRow = {
  id: string
  email: string
  full_name: string | null
  role: string
}

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-dorado/10 text-dorado-dark',
  client: 'bg-celeste/10 text-celeste-deep',
  user: 'bg-gris/20 text-muted',
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page: pageParam } = await searchParams
  const query = q?.trim().toLowerCase() ?? ''
  const page = Math.max(1, Number(pageParam) || 1)

  const admin = createAdminClient()
  // listUsers() paginates at 50/page by default — fetch the full set in one go so search
  // and pagination below operate over ALL users, not just the API's first page
  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, full_name, role'),
  ])

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
  let users: UserRow[] = (authData?.users ?? []).map((u) => {
    const profile = profileById.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '—',
      full_name: profile?.full_name ?? null,
      role: profile?.role ?? 'user',
    }
  })

  if (query) {
    users = users.filter((u) => u.full_name?.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
  }

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const from = (page - 1) * PAGE_SIZE
  const pageUsers = users.slice(from, from + PAGE_SIZE)

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('page', String(p))
    return `/admin/users?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-brand text-2xl text-ink">Usuarios</h1>
            <p className="mt-1 text-sm text-muted">Buscá, editá el rol, el nombre o la contraseña de cualquier usuario</p>
          </div>
          <Link
            href="/admin/users/new"
            className="shrink-0 rounded-lg bg-celeste px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            + Nuevo usuario
          </Link>
        </div>

        <form action="/admin/users" className="mt-6">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o email..."
            className="w-full max-w-sm rounded-lg border border-gris/40 px-4 py-2.5 text-sm focus:border-celeste focus:outline-none focus:ring-2 focus:ring-celeste/30"
          />
        </form>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gris/30 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((u) => (
                <tr key={u.id} className="border-b border-gris/20 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{u.full_name ?? '—'}</td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass[u.role] ?? roleBadgeClass.user}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="rounded-lg border border-gris/40 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No se encontraron usuarios</p>}

          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </main>
    </div>
  )
}
