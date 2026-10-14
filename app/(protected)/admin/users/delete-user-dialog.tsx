'use client'

import { useActionState, type RefObject } from 'react'
import { deleteUserAsAdmin, type DeleteUserState } from '@/app/actions/admin'

const initialState: DeleteUserState = { error: null }

const deletedItems = [
  'La cuenta y su acceso',
  'Su servicio, con fotos, reseñas y likes recibidos',
  'Sus likes, calificaciones y comentarios',
  'Su suscripción (se cancela en Stripe si está activa)',
  'Sus invitaciones gratuitas',
]

type DeleteUserDialogProps = {
  ref: RefObject<HTMLDialogElement | null>
  userId: string
  name: string | null
  email: string
}

export function DeleteUserDialog({ ref, userId, name, email }: DeleteUserDialogProps) {
  const [state, formAction, isPending] = useActionState(deleteUserAsAdmin, initialState)

  function close() {
    if (!isPending) ref.current?.close()
  }

  return (
    <dialog
      ref={ref}
      onClick={(event) => event.target === ref.current && close()}
      onCancel={(event) => isPending && event.preventDefault()}
      className="m-auto w-full max-w-md rounded-2xl bg-white p-0 text-left shadow-soft backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl">⚠️</div>
        <h2 className="mt-4 font-brand uppercase text-xl text-ink">Eliminar usuario</h2>
        <p className="mt-2 text-sm text-muted">
          Vas a eliminar a <strong className="text-ink">{name ?? email}</strong>
          {name && <span> ({email})</span>}.
        </p>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-bold text-red-700">Esta acción es PERMANENTE y no se puede deshacer.</p>
          <p className="mt-2 text-xs font-medium text-red-700">Se borra todo lo siguiente:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-red-700">
            {deletedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {state.error && <p className="mt-4 text-sm font-semibold text-red-600">{state.error}</p>}

        <form action={formAction} className="mt-6 flex justify-end gap-2">
          <input type="hidden" name="userId" value={userId} />
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            className="cursor-pointer rounded-full border border-gris/40 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Eliminando...' : 'Eliminar definitivamente'}
          </button>
        </form>
      </div>
    </dialog>
  )
}
