"use client";

import type { Subcategory } from "@/types/database";

export type RubroOption = Pick<Subcategory, "id" | "category_id" | "name" | "slug">;

type Props = {
  rubros: RubroOption[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
};

// Segunda fila de chips en Explorar: rubros de la categoría elegida.
export function RubroChips({ rubros, activeSlug, onChange }: Props) {
  const chipClass = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
      active
        ? "bg-celeste-deep text-white"
        : "bg-white text-ink border border-gris/60 hover:border-celeste"
    }`;

  return (
    <div className="-mx-5 -mt-4 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:max-h-40 sm:flex-wrap sm:overflow-y-auto sm:px-0 [&::-webkit-scrollbar]:hidden [&>button]:shrink-0 [&>button]:whitespace-nowrap">
      <button type="button" onClick={() => onChange(null)} className={chipClass(activeSlug === null)}>
        Todos los rubros
      </button>
      {rubros.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.slug === activeSlug ? null : r.slug)}
          className={chipClass(activeSlug === r.slug)}
        >
          {r.name}
        </button>
      ))}
    </div>
  );
}
