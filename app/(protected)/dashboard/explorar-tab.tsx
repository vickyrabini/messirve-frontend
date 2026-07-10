"use client";

import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/service-card";
import { getCategoryColor } from "@/lib/category-colors";
import type { Category, ServiceWithStats } from "@/types/database";

type Props = {
  fullName: string;
  categories: Category[];
  services: ServiceWithStats[];
};

export function ExplorarTab({ fullName, categories, services }: Props) {
  const firstName = fullName.trim().split(" ")[0] || "";
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      const matchesCategory =
        !categorySlug || s.categories?.slug === categorySlug;
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [services, query, categorySlug]);

  return (
    <div>
      {/* Hero de búsqueda */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-celeste px-8 py-10 sm:px-11 sm:py-12">
        <div className="relative">
          <h2 className="font-brand uppercase text-3xl leading-none text-white sm:text-[38px]">
            Hola{firstName ? `, ${firstName}` : ""} 👋
          </h2>
          <p className="mt-3 text-[17px] text-white/90 sm:text-[19px]">
            ¿Qué estás buscando hoy? Todo lo nuestro, reseñado por los tuyos.
          </p>
          <div className="mt-6 flex max-w-xl items-center gap-3 rounded-full bg-cream py-2 pl-6 pr-2">
            <svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7A756A"
              strokeWidth={2.2}
              className="shrink-0"
            >
              <circle cx={11} cy={11} r={7} />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Empanadas, gestor, mudanzas, tango…"
              className="flex-1 border-none bg-transparent text-[16px] text-ink outline-none placeholder:text-muted/70"
            />
          </div>
        </div>
      </div>
      {/* Chips de categoría */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCategorySlug(null)}
          className={`rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
            categorySlug === null
              ? "bg-celeste-deep text-white"
              : "bg-white text-ink border border-gris/60 hover:border-celeste"
          }`}
        >
          Todos
        </button>
        {categories.map((c, i) => {
          const color = getCategoryColor(c.slug, i);
          const active = categorySlug === c.slug;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                setCategorySlug(c.slug === categorySlug ? null : c.slug)
              }
              className={`rounded-full px-4 py-2 text-[14px] font-semibold transition-all ${color.bg} ${color.text} ${color.hover} ${
                active ? "ring-2 ring-offset-2 ring-ink" : ""
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="font-brand text-xl text-ink uppercase">
          Recomendados para vos
        </h3>
        <span className="text-[14px] text-muted">
          {filtered.length} servicios
        </span>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gris/40 bg-white p-10 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-[15px] font-semibold text-ink">
            No encontramos nada con esa búsqueda
          </p>
          <p className="mt-1 text-sm text-muted">
            Probá con otra palabra o categoría
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
