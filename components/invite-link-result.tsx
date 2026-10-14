'use client'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

type InviteLinkResultProps = {
  link: string
}

export default function InviteLinkResult({ link }: InviteLinkResultProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className="space-y-3 rounded-lg border border-celeste/40 bg-celeste/10 px-4 py-4">
      <p className="text-base font-bold text-celeste-deep">✅ ¡Link de invitación creado con éxito!</p>
      <p className="text-sm text-ink">
        <strong>Importante:</strong> la invitación NO se envía automáticamente. Copiá el link de abajo y mandáselo
        vos mismo a la persona invitada (por WhatsApp, email, etc.).
      </p>
      <div className="flex items-center gap-2">
        <input readOnly value={link} className="w-full truncate rounded-lg border border-gris/40 bg-white px-3 py-2 text-xs" />
        <button
          type="button"
          onClick={() => copy(link)}
          className="shrink-0 cursor-pointer rounded-lg border border-celeste px-3 py-2 text-xs font-semibold text-celeste-deep transition-colors hover:bg-celeste/10"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-xs text-muted">Recordá: el link vence en 7 días y solo puede usarse una vez.</p>
    </div>
  )
}
