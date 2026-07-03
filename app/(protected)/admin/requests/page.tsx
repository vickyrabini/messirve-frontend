import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Pagination } from '../pagination'
import type { ClientRequestStatus } from '@/types/database'

const PAGE_SIZE = 10

type RequestRow = {
  id: string
  user_id: string
  status: ClientRequestStatus
  created_at: string
}

const statusBadgeClass: Record<ClientRequestStatus, string> = {
  pending: 'bg-dorado/10 text-dorado-dark',
  approved: 'bg-celeste/10 text-celeste-deep',
  rejected: 'bg-red-50 text-red-500',
}
const statusLabel: Record<ClientRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()
  const { data: requests, count } = await admin
    .from('client_requests')
    .select('id, user_id, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
    .returns<RequestRow[]>()

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const userIds = (requests ?? []).map((r) => r.user_id)
  const [profilesResult, authResults] = await Promise.all([
    userIds.length ? admin.from('profiles').select('id, full_name').in('id', userIds) : Promise.resolve({ data: [] }),
    Promise.all(userIds.map((id) => admin.auth.admin.getUserById(id))),
  ])
  const nameById = new Map((profilesResult.data ?? []).map((p) => [p.id, p.full_name]))
  const emailById = new Map(userIds.map((id, i) => [id, authResults[i].data.user?.email ?? '—']))

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-brand text-2xl text-ink">Gestión de clientes</h1>
        <p className="mt-1 text-sm text-muted">Aprobá o rechazá las solicitudes para convertirse en cliente</p>

        <div className="mt-8 rounded-2xl border border-gris/30 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {(requests ?? []).map((r) => (
                  <tr key={r.id} className="border-b border-gris/20 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{nameById.get(r.user_id) ?? '—'}</td>
                    <td className="px-5 py-3 text-muted">{emailById.get(r.user_id) ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[r.status]}`}>
                        {statusLabel[r.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/requests/${r.id}`}
                        className="rounded-lg border border-gris/40 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                      >
                        Ver solicitud
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(requests ?? []).length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted">No hay solicitudes cargadas</p>
          )}

          <Pagination page={page} totalPages={totalPages} buildHref={(p) => `/admin/requests?page=${p}`} />
        </div>
      </main>
    </div>
  )
}
