import type { SupabaseClient } from '@supabase/supabase-js'

// Valida el rubro elegido contra la categoría. Lo usan los 4 flujos que crean o editan
// un servicio (crear, registro de cliente, registro gratis, edición dueño/admin).
// Regla: si la categoría tiene rubros, el rubro es obligatorio y debe ser de esa categoría;
// si no tiene, el servicio queda sin rubro. La FK compuesta en la DB lo refuerza.
export async function parseSubcategory(
  formData: FormData,
  categoryId: string,
  db: SupabaseClient
): Promise<{ subcategory_id: string | null } | { error: string }> {
  const subcategoryId = (formData.get('subcategoryId') as string)?.trim() || null

  const { data: rubros, error } = await db.from('subcategories').select('id').eq('category_id', categoryId)
  if (error) return { error: 'No se pudo validar el rubro. Intentá de nuevo.' }

  if (!rubros || rubros.length === 0) return { subcategory_id: null }
  if (!subcategoryId) return { error: 'Elegí un rubro para la categoría' }
  if (!rubros.some((r) => r.id === subcategoryId)) return { error: 'El rubro no corresponde a la categoría elegida' }

  return { subcategory_id: subcategoryId }
}
