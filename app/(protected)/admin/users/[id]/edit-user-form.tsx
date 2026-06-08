'use client'

import { useActionState } from 'react'
import { updateUser, type UpdateUserState } from '@/app/actions/admin'

const initialState: UpdateUserState = { error: null }

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gris/40 text-sm focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste'

const labelClass = 'block text-sm font-medium text-ink mb-1'

export function EditUserForm({ userId, email, fullName, role }: { userId: string; email: string; fullName: string; role: string }) {
  const [state, formAction, isPending] = useActionState(updateUser, initialState)

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gris/30 bg-white p-6">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <span className={labelClass}>Email</span>
        <p className="rounded-lg border border-gris/20 bg-cream/60 px-4 py-2.5 text-sm text-muted">{email}</p>
      </div>

      <div>
        <label htmlFor="fullName" className={labelClass}>
          Nombre completo
        </label>
        <input id="fullName" name="fullName" type="text" required defaultValue={fullName} className={inputClass} />
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          Rol
        </label>
        <select id="role" name="role" required defaultValue={role} className={inputClass}>
          <option value="user">user</option>
          <option value="client">client</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          placeholder="Dejar vacío para no cambiarla"
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">{state.error}</p>}
      {state?.success && (
        <p className="rounded-lg bg-celeste/10 px-3 py-2 text-sm font-semibold text-celeste-deep">Usuario actualizado correctamente.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer rounded-lg bg-celeste px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
