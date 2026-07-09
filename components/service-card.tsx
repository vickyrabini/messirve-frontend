import Link from 'next/link'
import { StarRating } from '@/components/star-rating'
import { toggleLike } from '@/app/actions/services'
import type { ServiceWithStats } from '@/types/database'

export const PLACEHOLDER_COLORS: Record<string, [string, string]> = {
  hogar: ['#72B8E6', '#4A9FD4'],
  gastronomia: ['#E8956A', '#D4733E'],
  'salud-bienestar': ['#7EC8A4', '#4FAF7E'],
  'arte-entretenimiento': ['#B07EC8', '#8A4FAF'],
  'indumentaria-belleza': ['#E87EB0', '#D44F8A'],
  'hospedaje-turistas': ['#C9A96D', '#A8834A'],
  'asesoria-gestoria': ['#6A9FE8', '#4A7FCC'],
}

type Props = {
  service: ServiceWithStats
}

export function ServiceCard({ service }: Props) {
  const photo = service.photos?.[0]
  const category = service.categories
  const [from, to] = PLACEHOLDER_COLORS[category?.slug ?? ''] ?? ['#72B8E6', '#4A9FD4']

  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-card">
      <div className="relative h-[210px]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <span className="text-5xl opacity-60">{category?.emoji ?? '🏷️'}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex h-[110px] flex-col justify-end bg-gradient-to-t from-black/70 to-transparent px-3.5 pb-3">
          <p className="truncate text-[19px] font-bold leading-[25px] text-white">{service.name}</p>
          <div className="flex items-center gap-1.5">
            <StarRating value={service.avg_rating} size={13} />
            <span className="text-xs text-white/90">
              {service.total_ratings > 0
                ? `${service.avg_rating.toFixed(1)} · ${service.total_ratings} reseña${service.total_ratings !== 1 ? 's' : ''}`
                : 'Sin reseñas aún'}
            </span>
          </div>
        </div>

        {category?.name && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1">
            <span className="text-[11px]">{category.emoji}</span>
            <span className="text-[10px] font-bold tracking-wide text-ink">{category.name}</span>
          </div>
        )}

        <form action={toggleLike} className="absolute right-2.5 top-2.5">
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="liked" value={String(service.user_liked)} />
          <button
            type="submit"
            aria-label={service.user_liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-full bg-white/90 text-lg shadow-sm"
          >
            <span className={service.user_liked ? 'text-red-500' : 'text-muted'}>
              {service.user_liked ? '♥' : '♡'}
            </span>
          </button>
        </form>
      </div>

      <div className="bg-white px-3.5 pb-3.5 pt-3">
        <div className="flex items-center gap-1.5">
          {service.address && (
            <p className="flex-1 truncate text-[13px] text-muted">
              <span className="text-celeste">📍</span> {service.address}, {service.city}
            </p>
          )}
          {service.price_info && (
            <span className="shrink-0 rounded-lg bg-dorado/10 px-2 py-[3px] text-[11px] font-bold text-dorado">
              {service.price_info}
            </span>
          )}
        </div>

        {service.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-[19px] text-muted">{service.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-gris/30 pt-2.5">
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="text-red-500">♥</span>
            {service.total_likes > 0
              ? `${service.total_likes} favorito${service.total_likes !== 1 ? 's' : ''}`
              : 'Sé el primero'}
          </span>
          <Link href={`/services/${service.id}`} className="text-[13px] font-bold text-celeste hover:underline">
            Ver más →
          </Link>
        </div>
      </div>
    </div>
  )
}
