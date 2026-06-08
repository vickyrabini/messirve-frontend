import { createAdminClient } from '@/lib/supabase/admin'
import { toggleServiceActive } from '@/app/actions/admin'
import { Pagination } from '../pagination'

const PAGE_SIZE = 10

type ServiceRow = {
  id: string
  name: string
  is_active: boolean
  user_id: string | null
  categories: { name: string; emoji: string | null } | null
}

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()
  const { data: services, count } = await admin
    .from('services')
    .select('id, name, is_active, user_id, categories(name, emoji)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
    .returns<ServiceRow[]>()

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-brand text-2xl text-ink">Gestionar servicios</h1>
        <p className="mt-1 text-sm text-muted">Activá los servicios pendientes de revisión o desactivá los publicados</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gris/30 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Creado por</th>
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
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.is_active ? 'bg-celeste/10 text-celeste-deep' : 'bg-dorado/10 text-dorado-dark'
                      }`}
                    >
                      {s.is_active ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={toggleServiceActive}>
                      <input type="hidden" name="serviceId" value={s.id} />
                      <input type="hidden" name="isActive" value={String(s.is_active)} />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg border border-gris/40 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                      >
                        {s.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(services ?? []).length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No hay servicios cargados</p>}

          <Pagination page={page} totalPages={totalPages} buildHref={(p) => `/admin/services?page=${p}`} />
        </div>
      </main>
    </div>
  )
}
