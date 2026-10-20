import { buildWhatsAppUrl } from '@/lib/whatsapp-link'

type Props = {
  phone: string
}

export function ServicePhoneLink({ phone }: Props) {
  const url = buildWhatsAppUrl(phone)

  if (!url) return <p className="mt-1 text-[15px] text-ink">{phone}</p>

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 block text-[15px] text-celeste-deep underline hover:text-celeste"
    >
      {phone}
    </a>
  )
}
