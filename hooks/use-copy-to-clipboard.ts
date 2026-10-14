'use client'

import { useState } from 'react'

export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false)

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), resetMs)
  }

  return { copied, copy }
}
