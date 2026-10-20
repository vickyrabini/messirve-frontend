import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import { escapeLike } from '@/lib/escape-like'
import { toCsv } from '@/lib/export/to-csv'
import { toXlsx } from '@/lib/export/to-xlsx'
import { isRole } from '../roles'
import { USERS_EXPORT_COLUMNS, type AdminUserExportRow } from '../users-export-columns'

const BATCH_SIZE = 1000 // PostgREST corta en 1000 filas por request
const IDS_CHUNK_SIZE = 100 // `in (...)` viaja en la URL: se parte para no pasarse de largo
const MAX_IDS = 5000
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const FORMATS = ['csv', 'xlsx'] as const
type Format = (typeof FORMATS)[number]

const isFormat = (value: unknown): value is Format => typeof value === 'string' && (FORMATS as readonly string[]).includes(value)

const isIdList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.length <= MAX_IDS && value.every((id) => typeof id === 'string' && UUID_REGEX.test(id))

const badRequest = (message: string) => Response.json({ error: message }, { status: 400 })

async function requireAdmin() {
  const caller = await getCurrentProfile()
  return caller?.role === 'admin'
}

function usersView() {
  return createAdminClient()
    .from('admin_users_view')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
}

async function fetchFiltered(role: string | null, q: string): Promise<AdminUserExportRow[]> {
  const rows: AdminUserExportRow[] = []
  for (let from = 0; ; from += BATCH_SIZE) {
    let request = usersView().range(from, from + BATCH_SIZE - 1)
    if (q) request = request.ilike('email', `%${escapeLike(q)}%`)
    if (role) request = request.eq('role', role)
    const { data, error } = await request.returns<AdminUserExportRow[]>()
    if (error) throw error
    rows.push(...data)
    if (data.length < BATCH_SIZE) return rows
  }
}

async function fetchByIds(ids: string[]): Promise<AdminUserExportRow[]> {
  const rows: AdminUserExportRow[] = []
  for (let i = 0; i < ids.length; i += IDS_CHUNK_SIZE) {
    const { data, error } = await usersView().in('id', ids.slice(i, i + IDS_CHUNK_SIZE)).returns<AdminUserExportRow[]>()
    if (error) throw error
    rows.push(...data)
  }
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

async function buildResponse(format: Format, rows: AdminUserExportRow[]) {
  const filename = `usuarios-${new Date().toISOString().slice(0, 10)}.${format}`
  const headers = { 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' }

  if (format === 'csv') {
    return new Response(toCsv(USERS_EXPORT_COLUMNS, rows), {
      headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8' }
    })
  }
  const buffer = await toXlsx('Usuarios', USERS_EXPORT_COLUMNS, rows)
  return new Response(new Uint8Array(buffer), {
    headers: { ...headers, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  })
}

// Exporta todo lo que coincide con el filtro actual (todas las páginas).
export async function GET(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const params = new URL(request.url).searchParams
  const format = params.get('format')
  const role = params.get('role')
  if (!isFormat(format)) return badRequest('Formato inválido')
  if (role && !isRole(role)) return badRequest('Rol inválido')

  try {
    return await buildResponse(format, await fetchFiltered(role, params.get('q')?.trim() ?? ''))
  } catch {
    return Response.json({ error: 'No se pudo generar la exportación' }, { status: 500 })
  }
}

// Exporta exactamente los usuarios seleccionados a mano.
export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body: { format?: unknown; ids?: unknown } | null = await request.json().catch(() => null)
  if (!isFormat(body?.format)) return badRequest('Formato inválido')
  if (!isIdList(body?.ids)) return badRequest(`Seleccioná entre 1 y ${MAX_IDS} usuarios`)

  try {
    return await buildResponse(body.format, await fetchByIds(body.ids))
  } catch {
    return Response.json({ error: 'No se pudo generar la exportación' }, { status: 500 })
  }
}
