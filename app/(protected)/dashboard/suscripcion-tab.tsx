import Link from 'next/link'
import { ClientRequestCard } from './client-request-card'
import type { ClientRequestStatus } from '@/types/database'

type Props = {
  role: 'admin' | 'client' | 'user'
  ownService: { id: string; name: string; is_active: boolean } | null
  clientRequest: { status: ClientRequestStatus; message: string | null } | null
}

export function SuscripcionTab({ role, ownService, clientRequest }: Props) {
  if (role === 'client') {
    return (
      <div className="max-w-2xl">
        <div className="rounded-[20px] border border-gris/40 bg-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-brand text-2xl uppercase text-ink">Mi servicio</p>
              <p className="mt-1 text-[15px] text-muted">
                {ownService ? ownService.name : 'Todavía no publicaste tu servicio'}
              </p>
            </div>
            {ownService && (
              <span
                className={`rounded-full px-4 py-1.5 text-[13.5px] font-semibold ${
                  ownService.is_active ? 'bg-[#E7F1E9] text-[#2E7D46]' : 'bg-dorado/15 text-dorado-dark'
                }`}
              >
                {ownService.is_active ? 'Publicado' : 'Pendiente de revisión'}
              </span>
            )}
          </div>

          <Link
            href={ownService ? `/dashboard/services/${ownService.id}/edit` : '/dashboard/services/new'}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-celeste px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-celeste-dark"
          >
            {ownService ? 'Editar mi servicio' : '+ Publicar un servicio'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <ClientRequestCard request={clientRequest} />
    </div>
  )
}
