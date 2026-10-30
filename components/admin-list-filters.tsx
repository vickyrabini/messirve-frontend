"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const filterClass =
  "rounded-lg border border-gris/40 px-4 py-2.5 text-sm focus:border-celeste focus:outline-none focus:ring-2 focus:ring-celeste/30";

export type AdminListFilterOption = { value: string; label: string };

export type AdminListSelect = {
  param: string;
  label: string;
  allLabel: string;
  options: AdminListFilterOption[];
  initial: string | null;
};

type Props = {
  basePath: string;
  searchPlaceholder: string;
  selects: AdminListSelect[];
  initialQuery: string;
};

type SelectValues = Record<string, string>;

export function AdminListFilters({
  basePath,
  searchPlaceholder,
  selects,
  initialQuery,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<SelectValues>(() =>
    Object.fromEntries(selects.map((s) => [s.param, s.initial ?? ""])),
  );
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  // Sin `page`: cada cambio de filtro vuelve a la página 1.
  const applyFilters = (q: string, values: SelectValues) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    for (const [param, value] of Object.entries(values)) {
      if (value) params.set(param, value);
    }
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${basePath}?${qs}` : basePath));
  };

  useEffect(() => {
    if (debouncedQuery !== initialQuery) applyFilters(debouncedQuery, selected);
    // Solo reacciona al texto ya "asentado"; los selects aplican por su cuenta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const changeSelect = (param: string, value: string) => {
    const next = { ...selected, [param]: value };
    setSelected(next);
    applyFilters(query.trim(), next);
  };

  const hasFilters = !!query || Object.values(selected).some(Boolean);

  const clearFilters = () => {
    const empty = Object.fromEntries(selects.map((s) => [s.param, ""]));
    setQuery("");
    setSelected(empty);
    applyFilters("", empty);
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters(query.trim(), selected);
      }}
      className={`mt-6 flex flex-wrap items-center gap-2 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder.replace(/\.+$/, "")}
        className={`${filterClass} w-full max-w-sm`}
      />
      {selects.map((s) => (
        <select
          key={s.param}
          value={selected[s.param] ?? ""}
          onChange={(e) => changeSelect(s.param, e.target.value)}
          aria-label={s.label}
          className={`${filterClass} bg-white`}
        >
          <option value="">{s.allLabel}</option>
          {s.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          Limpiar filtros
        </button>
      )}
    </form>
  );
}
