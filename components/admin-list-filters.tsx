"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const filterClass =
  "rounded-lg border border-gris/40 px-4 py-2.5 text-sm focus:border-celeste focus:outline-none focus:ring-2 focus:ring-celeste/30";

export type AdminListFilterOption = { value: string; label: string };

type Props = {
  basePath: string;
  searchPlaceholder: string;
  selectParam: string;
  selectLabel: string;
  selectAllLabel: string;
  options: AdminListFilterOption[];
  initialQuery: string;
  initialSelect: string | null;
};

export function AdminListFilters({
  basePath,
  searchPlaceholder,
  selectParam,
  selectLabel,
  selectAllLabel,
  options,
  initialQuery,
  initialSelect,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(initialSelect ?? "");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  // Sin `page`: cada cambio de filtro vuelve a la página 1.
  const applyFilters = (q: string, s: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set(selectParam, s);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${basePath}?${qs}` : basePath));
  };

  useEffect(() => {
    if (debouncedQuery !== initialQuery) applyFilters(debouncedQuery, selected);
    // Solo reacciona al texto ya "asentado"; el select aplica por su cuenta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const clearFilters = () => {
    setQuery("");
    setSelected("");
    applyFilters("", "");
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
      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          applyFilters(query.trim(), e.target.value);
        }}
        aria-label={selectLabel}
        className={`${filterClass} bg-white`}
      >
        <option value="">{selectAllLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(query || selected) && (
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
