export const CATEGORY_COLORS = [
  { bg: 'bg-dorado', text: 'text-ink', hover: 'hover:bg-dorado-light' },
  { bg: 'bg-celeste', text: 'text-cream', hover: 'hover:bg-celeste-dark' },
  { bg: 'bg-celeste-deep', text: 'text-cream', hover: 'hover:bg-[#15212F]' },
] as const

const CATEGORY_COLOR_OVERRIDES: Record<string, number> = {
  'arte-entretenimiento': 1,
  'indumentaria-belleza': 2,
  'hospedaje-turistas': 1,
}

export function getCategoryColor(slug: string, index: number) {
  return CATEGORY_COLORS[CATEGORY_COLOR_OVERRIDES[slug] ?? index % 3]
}
