'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ClientRequestState = { error: string | null; success?: boolean }

export async function requestClientRole(_state: ClientRequestState, formData: FormData): Promise<ClientRequestState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión' }
  }

  // Defense in depth — verify role server-side, never trust the dashboard gate alone
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'user') {
    return { error: 'No podés solicitar este cambio' }
  }

  const message = (formData.get('message') as string)?.trim() || null

  // A user can only ever have one row (unique on user_id) — look for it first
  const { data: existing } = await supabase.from('client_requests').select('id, status').eq('user_id', user.id).maybeSingle()

  if (existing && existing.status !== 'rejected') {
    return { error: 'Ya tenés una solicitud registrada' }
  }

  if (existing) {
    // Retry after a rejection — reuse the same row, RLS only allows rejected -> pending
    const { error } = await supabase
      .from('client_requests')
      .update({ status: 'pending', message, reviewed_at: null, reviewed_by: null, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return { error: 'No se pudo enviar la solicitud. Intentá de nuevo.' }
  } else {
    const { error } = await supabase.from('client_requests').insert({ user_id: user.id, message, status: 'pending' })
    if (error) return { error: 'No se pudo enviar la solicitud. Intentá de nuevo.' }
  }

  revalidatePath('/dashboard')
  return { error: null, success: true }
}
