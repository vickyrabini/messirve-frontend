const widths = {
  narrow: 'max-w-md',
  default: 'max-w-4xl',
  wide: 'max-w-7xl',
} as const

// Contenedor común de las páginas del admin: centrado, con el mismo padding en todas.
// `wide` para listados con tablas, `narrow` para formularios cortos.
export function AdminPageContainer({
  size = 'default',
  children,
}: {
  size?: keyof typeof widths
  children: React.ReactNode
}) {
  return <div className={`mx-auto w-full ${widths[size]} px-5 py-8 sm:px-8 sm:py-10`}>{children}</div>
}
