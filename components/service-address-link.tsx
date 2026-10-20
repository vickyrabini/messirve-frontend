import { buildMapsUrl } from '@/lib/maps-link'
import type { Service } from '@/types/database'

type Props = {
  service: Pick<Service, 'address' | 'city' | 'latitude' | 'longitude'>
}

export function ServiceAddressLink({ service }: Props) {
  const url = buildMapsUrl(service)
  if (!url) return null

  if (service.address) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block text-[15px] text-celeste-deep underline hover:text-celeste"
      >
        {service.address}, {service.city}
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex items-center rounded-lg bg-celeste px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-celeste-dark"
    >
      Cómo llegar
    </a>
  )
}
