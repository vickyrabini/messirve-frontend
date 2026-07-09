export type ReviewItem = {
  serviceId: string
  serviceName: string
  stars: number | null
  comment: string | null
  date: string
}

type Props = {
  reviews: ReviewItem[]
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ResenasTab({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-gris/40 bg-white p-10 text-center">
        <p className="text-4xl">⭐</p>
        <p className="mt-3 text-[15px] font-semibold text-ink">Todavía no dejaste ninguna reseña</p>
        <p className="mt-1 text-sm text-muted">Calificá los servicios que probaste para ayudar a tu comunidad</p>
      </div>
    )
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {reviews.map((r) => (
        <div key={r.serviceId} className="rounded-[18px] border border-gris/40 bg-white px-6 py-6">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-celeste font-brand text-lg text-white">
              {r.serviceName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-[17px] font-semibold text-ink">{r.serviceName}</p>
              <p className="text-[13px] text-muted">{formatDate(r.date)}</p>
            </div>
            {r.stars !== null && (
              <span className="text-[18px] tracking-[2px] text-dorado">
                {'★'.repeat(r.stars)}
                <span className="text-gris">{'★'.repeat(5 - r.stars)}</span>
              </span>
            )}
          </div>
          {r.comment && <p className="mt-4 text-[17px] italic leading-[1.45] text-[#43413B]">&quot;{r.comment}&quot;</p>}
        </div>
      ))}
    </div>
  )
}
