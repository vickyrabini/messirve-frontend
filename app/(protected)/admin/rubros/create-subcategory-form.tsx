'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createSubcategory } from '@/app/actions/subcategories'
import { SubmitButton } from '../free-accounts/submit-button'

export function CreateSubcategoryForm({ categoryId }: { categoryId: string }) {
  const [state, formAction] = useActionState(createSubcategory, { error: null })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="mt-5 border-t border-gris/20 pt-4">
      <input type="hidden" name="categoryId" value={categoryId} />
      <div className="flex gap-2">
        <input
          name="name"
          required
          placeholder="Nuevo rubro (ej. Peluquería)"
          className="min-w-0 flex-1 rounded-full border border-gris/40 px-4 py-2 text-sm text-ink outline-none focus:border-celeste"
        />
        <SubmitButton
          pendingLabel="Agregando..."
          className="shrink-0 cursor-pointer rounded-full bg-celeste px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-celeste-dark"
        >
          + Agregar
        </SubmitButton>
      </div>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  )
}
