'use client'

import { deleteInvite } from '@/app/actions/free-accounts'
import { SubmitButton } from './submit-button'

export function DeleteInviteButton({ inviteId, email }: { inviteId: string; email: string }) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`¿Eliminar la invitación de ${email}? El link deja de funcionar y no se puede deshacer.`)) {
      event.preventDefault()
    }
  }

  return (
    <form action={deleteInvite} onSubmit={handleSubmit}>
      <input type="hidden" name="inviteId" value={inviteId} />
      <SubmitButton
        pendingLabel="Eliminando..."
        className="cursor-pointer rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-red-400 hover:text-red-600"
      >
        Eliminar
      </SubmitButton>
    </form>
  )
}
