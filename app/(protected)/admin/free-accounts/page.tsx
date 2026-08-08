import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { revokeInvite, convertFreeAccountToPaid } from '@/app/actions/free-accounts'
import type { ClientInvite } from '@/types/database'

const statusBadge: Record<ClientInvite['status'], { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-celeste/10 text-celeste-deep' },
  used: { label: 'Usada', className: 'bg-[#E7F1E9] text-[#2E7D46]' },
  expired: { label: 'Expirada', className: 'bg-gris/20 text-muted' },
  revoked: { label: 'Revocada', className: 'bg-gris/20 text-muted' },
}

type FreeClientRow = {
  id: string
  email: string
  fullName: string | null
  service: { id: string; name: string; is_active: boolean } | null
}

export default async function AdminFreeAccountsPage() {
  const admin = createAdminClient()

  const [{ data: invites }, { data: freeProfiles }, { data: authData }] = await Promise.all([
    admin.from('client_invites').select('*').order('created_at', { ascending: false }).returns<ClientInvite[]>(),
    admin.from('profiles').select('id, full_name').eq('account_type', 'free'),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const freeUserIds = (freeProfiles ?? []).map((p) => p.id)
  const { data: services } = freeUserIds.length
    ? await admin.from('services').select('id, name, is_active, user_id').in('user_id', freeUserIds)
    : { data: [] }

  const emailById = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? '—']))
  const serviceByUserId = new Map((services ?? []).map((s) => [s.user_id, s]))

  const freeClients: FreeClientRow[] = (freeProfiles ?? []).map((p) => ({
    id: p.id,
    email: emailById.get(p.id) ?? '—',
    fullName: p.full_name,
    service: serviceByUserId.get(p.id) ?? null,
  }))

  const now = new Date()

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-brand uppercase text-2xl text-ink">Cuentas gratuitas</h1>
          <p className="mt-1 text-sm text-muted">Invitaciones para dar de alta clientes sin pago y gestionar su paso a plan pago</p>
        </div>
        <Link
          href="/admin/free-accounts/new"
          className="shrink-0 rounded-full bg-celeste px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-celeste-dark"
        >
          + Nueva invitación
        </Link>
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-muted">Invitaciones</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-gris/30 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Vence</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(invites ?? []).map((invite) => {
                const isExpired = invite.status === 'pending' && new Date(invite.expires_at) < now
                const badge = statusBadge[isExpired ? 'expired' : invite.status]
                return (
                  <tr key={invite.id} className="border-b border-gris/20 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{invite.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(invite.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {invite.status === 'pending' && !isExpired && (
                        <form action={revokeInvite}>
                          <input type="hidden" name="inviteId" value={invite.id} />
                          <button
                            type="submit"
                            className="cursor-pointer rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                          >
                            Revocar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {(invites ?? []).length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">Todavía no creaste ninguna invitación</p>}
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-muted">Cuentas gratuitas activas</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-gris/30 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Servicio</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {freeClients.map((c) => (
                <tr key={c.id} className="border-b border-gris/20 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{c.fullName ?? '—'}</td>
                  <td className="px-5 py-3 text-muted">{c.email}</td>
                  <td className="px-5 py-3 text-muted">{c.service?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <form action={convertFreeAccountToPaid}>
                      <input type="hidden" name="userId" value={c.id} />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-full border border-dorado bg-dorado/10 px-3.5 py-1.5 text-xs font-semibold text-dorado-dark transition-colors hover:bg-dorado/20"
                      >
                        Pasar a cuenta paga
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {freeClients.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No hay cuentas gratuitas activas</p>}
      </div>
    </div>
  )
}
