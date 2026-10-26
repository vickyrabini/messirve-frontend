import { buildWebsiteLink } from '@/lib/website-link'

type Props = {
  website: string
}

export function ServiceWebsiteLink({ website }: Props) {
  const link = buildWebsiteLink(website)

  if (!link) return <p className="mt-1 text-[15px] text-ink">{website}</p>

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 block truncate text-[15px] text-celeste-deep hover:underline"
    >
      {link.label}
    </a>
  )
}
