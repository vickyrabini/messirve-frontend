export const ROLES = ['admin', 'client', 'user'] as const

export type Role = (typeof ROLES)[number]

export const isRole = (value: string | undefined | null): value is Role => !!value && (ROLES as readonly string[]).includes(value)

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  client: 'Cliente',
  user: 'Usuario'
}

export const roleBadgeClass: Record<string, string> = {
  admin: 'bg-dorado/10 text-dorado-dark',
  client: 'bg-celeste/10 text-celeste-deep',
  user: 'bg-gris/20 text-muted'
}
