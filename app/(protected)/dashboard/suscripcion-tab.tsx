import Link from 'next/link'
import { ClientRequestCard } from './client-request-card'
import { SunDecor } from '@/components/sun-decor'
import type { ClientRequestStatus } from '@/types/database'

type Props = {
  role: 'admin' | 'client' | 'user'
  ownService: { id: string; name: string; is_active: boolean } | null
  clientRequest: { status: ClientRequestStatus; message: string | null } | null
}

export function SuscripcionTab({ role, ownService, clientRequest }: Props) {
  if (role === 'client') {
    if (!ownService) {
      return (
        <div className="relative">
          <SunDecor className="pointer-events-none absolute -bottom-24 right-0 h-[420px] w-[420px] opacity-10" />
          <div className="max-w-2xl">
            <div className="relative rounded-[20px] border border-gris/40 bg-white px-8 py-12 text-center sm:px-10">
              <SunDecor className="mx-auto mb-5 h-16 w-16" />
              <p className="mx-auto max-w-[420px] text-[17px] leading-relaxed text-muted">
                Todavía no tenés un servicio publicado. Sumate como emprendedor para aparecer en búsquedas y
                gestionar tu suscripción acá.
              </p>
              <Link
                href="/dashboard/services/new"
                className="mt-6 inline-flex items-center rounded-full bg-dorado px-8 py-4 font-brand text-[15px] uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-dorado-light"
              >
                Sumate como emprendedor
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-2xl">
        <div className="rounded-[20px] border border-gris/40 bg-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-brand text-2xl uppercase text-ink">Mi servicio</p>
              <p className="mt-1 text-[15px] text-muted">{ownService.name}</p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-[13.5px] font-semibold ${
                ownService.is_active ? 'bg-[#E7F1E9] text-[#2E7D46]' : 'bg-dorado/15 text-dorado-dark'
              }`}
            >
              {ownService.is_active ? 'Publicado' : 'Pendiente de revisión'}
            </span>
          </div>

          <Link
            href={`/dashboard/services/${ownService.id}/edit`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-celeste px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-celeste-dark"
          >
            Editar mi servicio
          </Link>
        </div>
      </div>
    )
  }

  return <ClientRequestCard request={clientRequest} />
}
