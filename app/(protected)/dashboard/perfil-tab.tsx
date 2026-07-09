'use client'

import { useActionState, useState } from 'react'
import { updateProfile, deleteAccount } from '@/app/actions/profile'

const initialState = { error: null }

type Props = {
  fullName: string
  email: string
  memberSince: string
}

function formatMemberSince(iso: string) {
  if (!iso) return ''
  const label = new Date(iso).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return `Miembro desde ${label} · Barcelona`
}

export function PerfilTab({ fullName, email, memberSince }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div className="max-w-2xl">
      <div className="rounded-[20px] border border-gris/40 bg-white p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-celeste font-brand text-3xl text-white">
            {fullName.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-brand text-2xl text-ink">{fullName || 'Sin nombre'}</p>
            <p className="text-[15px] text-muted">{formatMemberSince(memberSince)}</p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-[14px] font-semibold text-[#43413B]">
              Nombre completo
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={fullName}
              required
              className="w-full rounded-xl border-[1.5px] border-gris/60 bg-cream px-4 py-3.5 text-[16px] text-ink outline-none transition-colors focus:border-celeste"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold text-[#43413B]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border-[1.5px] border-gris/60 bg-gris/15 px-4 py-3.5 text-[16px] text-muted"
            />
          </div>

          {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-500">{state.error}</p>}
          {state?.success && <p className="rounded-lg bg-[#E7F1E9] px-3 py-2 text-[13px] font-semibold text-[#2E7D46]">Perfil actualizado</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 self-start rounded-full bg-dorado px-8 py-3.5 text-[15px] font-bold uppercase tracking-wide text-celeste-deep transition-colors hover:bg-dorado-light disabled:opacity-60"
          >
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      <div className="mt-5 rounded-[20px] border border-gris/40 bg-white p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[16px] font-semibold text-ink">Eliminar cuenta</p>
            <p className="mt-1 text-[14px] text-muted">Se borran tu perfil, favoritos y reseñas. No se puede deshacer.</p>
          </div>

          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full px-5 py-2.5 text-[14px] font-semibold text-muted transition-colors hover:text-ink"
              >
                Cancelar
              </button>
              <form action={deleteAccount}>
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-[#A63B24] px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#8f2f1b]"
                >
                  Sí, eliminar definitivamente
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="shrink-0 rounded-full bg-[#FBEAE7] px-6 py-2.5 text-[14px] font-semibold text-[#A63B24] transition-colors hover:bg-[#f5d8d2]"
            >
              Eliminar cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
