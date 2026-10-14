'use client'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

export function CopyLinkButton({ link }: { link: string }) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      onClick={() => copy(link)}
      className="cursor-pointer rounded-full border border-celeste px-3.5 py-1.5 text-xs font-semibold text-celeste-deep transition-colors hover:bg-celeste/10"
    >
      {copied ? 'Copiado' : 'Copiar link'}
    </button>
  )
}
