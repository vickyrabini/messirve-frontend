import type { createAdminClient } from '@/lib/supabase/admin'

// Compartido entre el webhook de Stripe (cancelación de suscripción) y las acciones de
// borrado de cuenta — ambos casos terminan necesitando limpiar por completo el servicio
// de un usuario (reseñas, likes, fotos, la fila en sí). Tira (throw) en fallos reales de
// DB para que el llamador decida: el webhook deja que la excepción llegue al try/catch
// que ya tiene (Stripe reintenta el evento), las server actions la atajan y devuelven un
// error al usuario.
export async function deleteOwnedService(admin: ReturnType<typeof createAdminClient>, userId: string): Promise<void> {
  const { data: ownedService } = await admin.from('services').select('id, photos').eq('user_id', userId).maybeSingle()
  if (!ownedService) return

  const { error: commentsError } = await admin.from('service_comments').delete().eq('service_id', ownedService.id)
  if (commentsError) throw commentsError

  const { error: ratingsError } = await admin.from('service_ratings').delete().eq('service_id', ownedService.id)
  if (ratingsError) throw ratingsError

  const { error: likesError } = await admin.from('service_likes').delete().eq('service_id', ownedService.id)
  if (likesError) throw likesError

  const photos = (ownedService.photos as string[]) ?? []
  if (photos.length > 0) {
    const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-photos/`
    const paths = photos.filter((url) => url.startsWith(storageBase)).map((url) => url.slice(storageBase.length))
    if (paths.length > 0) {
      const { error: storageError } = await admin.storage.from('service-photos').remove(paths)
      if (storageError) {
        console.log('[deleteOwnedService] failed to remove service photos:', {
          message: storageError.message,
          serviceId: ownedService.id,
        })
      }
    }
  }

  const { error: deleteServiceError } = await admin.from('services').delete().eq('id', ownedService.id)
  if (deleteServiceError) throw deleteServiceError
}
