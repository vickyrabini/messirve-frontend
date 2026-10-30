'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentProfile } from '@/lib/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { toSlug } from '@/lib/services/service-photos'

export type CreateSubcategoryState = { error: string | null; success?: boolean }

export async function createSubcategory(
  _state: CreateSubcategoryState,
  formData: FormData
): Promise<CreateSubcategoryState> {
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') {
    return { error: 'No tenés permiso para crear rubros' }
  }

  const categoryId = (formData.get('categoryId') as string)?.trim()
  const name = (formData.get('name') as string)?.trim()
  if (!categoryId || !name) {
    return { error: 'El nombre del rubro es obligatorio' }
  }

  const slug = toSlug(name)
  if (!slug) {
    return { error: 'El nombre del rubro tiene que tener letras o números' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('subcategories').insert({ category_id: categoryId, name, slug })

  if (error) {
    // 23505 = unique (category_id, slug): mismo rubro ya cargado en esta categoría
    if (error.code === '23505') {
      return { error: 'Ese rubro ya existe en la categoría' }
    }
    console.log('[createSubcategory] insert error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    return { error: 'No se pudo crear el rubro. Intentá de nuevo.' }
  }

  revalidatePath('/admin/rubros')
  return { error: null, success: true }
}

export async function deleteSubcategory(formData: FormData): Promise<void> {
  const caller = await getCurrentProfile()
  if (!caller || caller.role !== 'admin') return

  const subcategoryId = formData.get('subcategoryId') as string
  if (!subcategoryId) return

  const admin = createAdminClient()
  await admin.from('subcategories').delete().eq('id', subcategoryId)

  revalidatePath('/admin/rubros')
}
