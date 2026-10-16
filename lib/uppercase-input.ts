import type { FormEvent } from 'react'

// Pasa a mayúscula lo que se escribe en un input no controlado sin que el cursor salte al final.
export function uppercaseOnInput(e: FormEvent<HTMLInputElement>) {
  const input = e.currentTarget
  const { selectionStart, selectionEnd } = input
  input.value = input.value.toUpperCase()
  input.setSelectionRange(selectionStart, selectionEnd)
}
