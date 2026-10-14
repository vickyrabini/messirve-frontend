'use client'

import { useRef } from 'react'
import { DeleteUserDialog } from './delete-user-dialog'

type DeleteUserButtonProps = {
  userId: string
  name: string | null
  email: string
}

export function DeleteUserButton({ userId, name, email }: DeleteUserButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="cursor-pointer rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-red-400 hover:text-red-600"
      >
        Eliminar
      </button>
      <DeleteUserDialog ref={dialogRef} userId={userId} name={name} email={email} />
    </>
  )
}
