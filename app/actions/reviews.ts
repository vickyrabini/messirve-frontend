'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SubmitReviewState = { error: string | null; success?: boolean }

export async function submitReview(_state: SubmitReviewState, formData: FormData): Promise<SubmitReviewState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión' }
  }

  const serviceId = formData.get('serviceId') as string
  const stars = Number(formData.get('stars'))
  const comment = (formData.get('comment') as string)?.trim() ?? ''

  if (!serviceId) {
    return { error: 'Servicio inválido' }
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { error: 'Elegí una calificación de 1 a 5 estrellas' }
  }

  const { error: ratingError } = await supabase
    .from('service_ratings')
    .upsert(
      { user_id: user.id, service_id: serviceId, stars, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,service_id' }
    )
  if (ratingError) {
    return { error: 'No se pudo guardar tu calificación. Intentá de nuevo.' }
  }

  // service_comments has no update policy by design — editing means delete-then-insert,
  // never a SQL UPDATE. Only touch it when the visitor actually typed a comment.
  if (comment) {
    await supabase.from('service_comments').delete().eq('user_id', user.id).eq('service_id', serviceId)
    const { error: commentError } = await supabase
      .from('service_comments')
      .insert({ user_id: user.id, service_id: serviceId, content: comment })
    if (commentError) {
      return { error: 'Se guardó tu calificación, pero no se pudo publicar el comentario. Intentá de nuevo.' }
    }
  }

  revalidatePath(`/services/${serviceId}`)
  return { error: null, success: true }
}
