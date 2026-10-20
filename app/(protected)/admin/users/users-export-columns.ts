import type { ExportColumn } from '@/lib/export/types'
import { paymentBadge, type PaymentKey } from '../services/payment-status'
import { isRole, ROLE_LABEL } from './roles'

// Fila de public.admin_users_view (supabase/migrations/20261020000100_admin_users_view.sql)
export type AdminUserRow = {
  id: string
  email: string | null
  role: string
  account_type: string
  created_at: string
  payment_key: PaymentKey
}

// Columnas que lista la tabla; el resto de la vista (datos del servicio) solo lo usa el export.
export const ADMIN_USER_ROW_COLUMNS = 'id, email, role, account_type, created_at, payment_key'

// Datos del servicio del usuario (20261020000200_admin_users_view_service.sql): null si no tiene.
export type AdminUserExportRow = AdminUserRow & {
  service_name: string | null
  service_category: string | null
  service_description: string | null
  service_address: string | null
  service_city: string | null
  service_phone: string | null
  service_website: string | null
  service_instagram: string | null
  service_price_info: string | null
  service_is_active: boolean | null
  service_approved: boolean | null
}

export function serviceStatusLabel(row: AdminUserExportRow): string {
  if (row.service_name == null) return ''
  if (!row.service_approved) return 'Pendiente de aprobación'
  return row.service_is_active ? 'Publicado' : 'Inactivo'
}

export const USERS_EXPORT_COLUMNS: ExportColumn<AdminUserExportRow>[] = [
  { header: 'Email', width: 36, value: (row) => row.email ?? '' },
  { header: 'Rol', width: 14, value: (row) => (isRole(row.role) ? ROLE_LABEL[row.role] : row.role) },
  { header: 'Tipo de cuenta', width: 16, value: (row) => (row.account_type === 'free' ? 'Gratuita' : 'Paga') },
  { header: 'Estado de pago', width: 16, value: (row) => paymentBadge[row.payment_key]?.label ?? '' },
  { header: 'Fecha de registro', width: 18, value: (row) => new Date(row.created_at) },
  { header: 'Servicio', width: 28, value: (row) => row.service_name ?? '' },
  { header: 'Categoría', width: 24, value: (row) => row.service_category ?? '' },
  { header: 'Descripción', width: 48, value: (row) => row.service_description ?? '' },
  { header: 'Dirección', width: 32, value: (row) => row.service_address ?? '' },
  { header: 'Ciudad', width: 16, value: (row) => row.service_city ?? '' },
  { header: 'Teléfono', width: 18, value: (row) => row.service_phone ?? '' },
  { header: 'Web', width: 30, value: (row) => row.service_website ?? '' },
  { header: 'Instagram', width: 20, value: (row) => row.service_instagram ?? '' },
  { header: 'Precio', width: 20, value: (row) => row.service_price_info ?? '' },
  { header: 'Estado del servicio', width: 22, value: serviceStatusLabel }
]
