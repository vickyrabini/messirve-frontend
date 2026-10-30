import Link from "next/link";
import type { Subcategory } from "@/types/database";

type Props = {
  rubros: Pick<Subcategory, "id" | "name" | "slug">[];
  counts: Map<string, number>;
  activeRubro?: string;
  totalInCategory: number;
  buildRubroHref: (rubro?: string) => string;
};

// Rubros de la categoría activa en el sidebar de /search. Con scroll propio porque la
// lista de rubros por categoría puede ser muy larga.
export function RubroFilterList({
  rubros,
  counts,
  activeRubro,
  totalInCategory,
  buildRubroHref,
}: Props) {
  const linkClass = (active: boolean) =>
    `flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${
      active ? "bg-celeste/10 text-celeste-deep" : "text-ink hover:bg-cream"
    }`;

  return (
    <div className="mb-1 ml-3 max-h-72 overflow-y-auto border-l border-gris/40 pl-2">
      <Link href={buildRubroHref()} className={linkClass(!activeRubro)}>
        Todos los rubros
        <span className="shrink-0 text-[12px] font-bold text-muted">{totalInCategory}</span>
      </Link>
      {rubros.map((r) => (
        <Link
          key={r.id}
          href={buildRubroHref(r.slug)}
          className={linkClass(activeRubro === r.slug)}
        >
          <span className="min-w-0">{r.name}</span>
          <span className="shrink-0 text-[12px] font-bold text-muted">
            {counts.get(r.id) ?? 0}
          </span>
        </Link>
      ))}
    </div>
  );
}
