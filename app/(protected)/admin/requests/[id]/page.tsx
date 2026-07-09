import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { approveClientRequest, rejectClientRequest } from '@/app/actions/admin'
import type { ClientRequest, ClientRequestStatus } from '@/types/database'

const statusBadgeClass: Record<ClientRequestStatus, string> = {
  pending: 'bg-dorado/10 text-dorado-dark',
  approved: 'bg-celeste/10 text-celeste-deep',
  rejected: '',
}
const statusBadgeStyle: Record<ClientRequestStatus, React.CSSProperties | undefined> = {
  pending: undefined,
  approved: undefined,
  rejected: { background: '#FBEAE7', color: '#A63B24' },
}
const statusLabel: Record<ClientRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const admin = createAdminClient()
  const { data: request } = await admin.from('client_requests').select('*').eq('id', id).single<ClientRequest>()

  if (!request) {
    notFound()
  }

  const [{ data: profile }, { data: authData }] = await Promise.all([
    admin.from('profiles').select('full_name').eq('id', request.user_id).single(),
    admin.auth.admin.getUserById(request.user_id),
  ])

  let reviewerName: string | null = null
  if (request.reviewed_by) {
    const { data: reviewerProfile } = await admin.from('profiles').select('full_name').eq('id', request.reviewed_by).single()
    reviewerName = reviewerProfile?.full_name ?? null
  }

  const fullName = profile?.full_name ?? '—'
  const email = authData?.user?.email ?? '—'

  return (
    <div className="mx-auto max-w-md px-8 py-10">
      <Link href="/admin/requests" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <span>←</span> Volver a solicitudes
      </Link>

      <h1 className="mt-4 font-brand uppercase text-2xl text-ink">Solicitud de {fullName}</h1>
      <p className="mt-1 text-sm text-muted">Revisá los datos y aprobá o rechazá la solicitud</p>

      <div className="mt-6 space-y-5 rounded-2xl border border-gris/30 bg-white p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Usuario</p>
            <p className="mt-1 text-sm text-ink">{fullName}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email</p>
            <p className="mt-1 text-sm text-ink">{email}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mensaje</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{request.message ?? '—'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estado</p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[request.status]}`}
              style={statusBadgeStyle[request.status]}
            >
              {statusLabel[request.status]}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fecha de solicitud</p>
            <p className="mt-1 text-sm text-ink">{formatDate(request.created_at)}</p>
          </div>

          {request.status !== 'pending' && request.reviewed_at && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Revisada</p>
              <p className="mt-1 text-sm text-ink">
                {formatDate(request.reviewed_at)}
                {reviewerName ? ` por ${reviewerName}` : ''}
              </p>
            </div>
          )}

          {request.status === 'pending' && (
            <div className="flex gap-3 pt-2">
              <form action={approveClientRequest}>
                <input type="hidden" name="requestId" value={request.id} />
                <input type="hidden" name="userId" value={request.user_id} />
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-celeste px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-celeste-dark"
                >
                  Aprobar
                </button>
              </form>
              <form action={rejectClientRequest}>
                <input type="hidden" name="requestId" value={request.id} />
                <button
                  type="submit"
                  className="cursor-pointer rounded-full border border-gris/40 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-[#E8B4AC] hover:text-[#A63B24]"
                >
                  Rechazar
                </button>
              </form>
            </div>
          )}
      </div>
    </div>
  )
}
