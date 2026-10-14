export function buildInviteLink(token: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/registro-gratis/${token}`
}
