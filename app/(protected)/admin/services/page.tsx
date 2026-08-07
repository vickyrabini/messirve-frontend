import { createAdminClient } from '@/lib/supabase/admin'
import { toggleServiceActive, approveService } from '@/app/actions/admin'
import { Pagination } from '@/components/pagination'
import type { SubscriptionStatus } from '@/types/database'

const PAGE_SIZE = 10

type ServiceRow = {
  id: string
  name: string
  is_active: boolean
  approved: boolean
  user_id: string | null
  categories: { name: string; emoji: string | null } | null
}

const paymentBadge: Record<SubscriptionStatus, { label: string; className: string }> = {
  active: { label: 'Pagado', className: 'bg-[#E7F1E9] text-[#2E7D46]' },
  trialing: { label: 'Pagado', className: 'bg-[#E7F1E9] text-[#2E7D46]' },
  past_due: { label: 'Pago vencido', className: 'bg-red-50 text-red-500' },
  unpaid: { label: 'Pago vencido', className: 'bg-red-50 text-red-500' },
  canceled: { label: 'Cancelado', className: 'bg-gris/20 text-muted' },
  incomplete: { label: 'Pendiente', className: 'bg-dorado/15 text-dorado-dark' },
  incomplete_expired: { label: 'Pendiente', className: 'bg-dorado/15 text-dorado-dark' },
  paused: { label: 'Pendiente', className: 'bg-dorado/15 text-dorado-dark' },
}
const NO_PAYMENT = { label: 'Sin pago', className: 'bg-gris/20 text-muted' }

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()
  const { data: services, count } = await admin
    .from('services')
    .select('id, name, is_active, approved, user_id, categories(name, emoji)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
    .returns<ServiceRow[]>()

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const userIds = [...new Set((services ?? []).map((s) => s.user_id).filter((id): id is string => id !== null))]
  const { data: subs } = userIds.length
    ? await admin.from('subscriptions').select('user_id, status').in('user_id', userIds)
    : { data: [] }
  const statusByUser = new Map((subs ?? []).map((s) => [s.user_id, s.status]))

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-brand uppercase text-2xl text-ink">Gestionar servicios</h1>
      <p className="mt-1 text-sm text-muted">Activá los servicios pendientes de revisión o desactivá los publicados</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gris/30 bg-white">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Creado por</th>
                <th className="px-5 py-3 font-medium">Pago</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(services ?? []).map((s) => (
                <tr key={s.id} className="border-b border-gris/20 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{s.name}</td>
                  <td className="px-5 py-3 text-muted">
                    {s.categories ? `${s.categories.emoji ? `${s.categories.emoji} ` : ''}${s.categories.name}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-muted">{s.user_id ? 'Usuario' : 'Admin (panel)'}</td>
                  <td className="px-5 py-3">
                    {s.user_id === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      (() => {
                        const status = statusByUser.get(s.user_id)
                        const badge = status ? paymentBadge[status] : NO_PAYMENT
                        return (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        )
                      })()
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.is_active ? 'bg-celeste/10 text-celeste-deep' : 'bg-dorado/10 text-dorado-dark'
                      }`}
                    >
                      {s.is_active ? 'Activo' : 'Desactivado'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {!s.approved && (
                        <form action={approveService}>
                          <input type="hidden" name="serviceId" value={s.id} />
                          <button
                            type="submit"
                            className="cursor-pointer rounded-full border border-celeste bg-celeste/10 px-3.5 py-1.5 text-xs font-semibold text-celeste-deep transition-colors hover:bg-celeste/20"
                          >
                            Aprobar
                          </button>
                        </form>
                      )}
                      <form action={toggleServiceActive}>
                        <input type="hidden" name="serviceId" value={s.id} />
                        <input type="hidden" name="isActive" value={String(s.is_active)} />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                        >
                          {s.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {(services ?? []).length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No hay servicios cargados</p>}

          <Pagination page={page} totalPages={totalPages} buildHref={(p) => `/admin/services?page=${p}`} />
        </div>
    </div>
  )
}
