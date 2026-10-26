'use client'

import { useState } from 'react'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { PhoneHelpText } from '@/components/phone-help-text'

type Props = {
  id: string
  inputClassName: string
  defaultValue?: string | null
}

// Datos viejos (ej. '+34 931 234 567') se normalizan a E.164 para que el picker los cargue bien.
function toE164(value?: string | null): string {
  if (!value) return ''
  try {
    return parsePhoneNumber(value)?.number ?? ''
  } catch {
    return ''
  }
}

export function PhoneInputField({ id, inputClassName, defaultValue }: Props) {
  const [value, setValue] = useState<string>(() => toE164(defaultValue))
  const invalid = !!value && !isValidPhoneNumber(value)

  return (
    <>
      <PhoneInput
        id={id}
        defaultCountry="ES"
        international
        countryCallingCodeEditable={false}
        value={value}
        onChange={(next) => setValue(next ?? '')}
        numberInputProps={{ className: inputClassName }}
        className="flex items-center gap-2"
      />
      <input type="hidden" name="phone" value={value} />
      {invalid ? <p className="mt-1 text-xs font-semibold text-red-500">Teléfono inválido</p> : <PhoneHelpText />}
    </>
  )
}
