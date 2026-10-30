import Link from "next/link";
import type { Category, Subcategory } from "@/types/database";

type Props = {
  categories: Pick<Category, "id" | "name" | "slug">[];
  activeCategory?: string;
  rubros: Pick<Subcategory, "id" | "name" | "slug">[];
  activeRubro?: string;
  buildCategoryHref: (categoria?: string) => string;
  buildRubroHref: (rubro?: string) => string;
};

const rowClass =
  "-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const chipClass = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
    active
      ? "bg-celeste-deep text-white"
      : "border border-gris/60 bg-white text-ink"
  }`;

// Filtros de /search en mobile: filas de chips con scroll horizontal en lugar del
// listado vertical del sidebar, que empujaba los resultados muy abajo.
export function MobileFilterChips({
  categories,
  activeCategory,
  rubros,
  activeRubro,
  buildCategoryHref,
  buildRubroHref,
}: Props) {
  return (
    <div className="flex flex-col gap-2 lg:hidden">
      <nav className={rowClass} aria-label="Categorías">
        <Link href={buildCategoryHref()} className={chipClass(!activeCategory)}>
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildCategoryHref(c.slug)}
            className={chipClass(activeCategory === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </nav>
      {rubros.length > 0 && (
        <nav className={rowClass} aria-label="Rubros">
          <Link href={buildRubroHref()} className={chipClass(!activeRubro)}>
            Todos los rubros
          </Link>
          {rubros.map((r) => (
            <Link
              key={r.id}
              href={buildRubroHref(r.slug)}
              className={chipClass(activeRubro === r.slug)}
            >
              {r.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
