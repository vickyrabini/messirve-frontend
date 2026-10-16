"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PAYMENT_KEYS, paymentBadge, type PaymentKey } from "./payment-status";

const filterClass =
  "rounded-lg border border-gris/40 px-4 py-2.5 text-sm focus:border-celeste focus:outline-none focus:ring-2 focus:ring-celeste/30";

type Props = {
  initialQuery: string;
  initialPayment: PaymentKey | null;
};

export function ServicesFilters({ initialQuery, initialPayment }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [payment, setPayment] = useState<PaymentKey | "">(
    initialPayment ?? "",
  );
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  // Sin `page`: cada cambio de filtro vuelve a la página 1.
  const applyFilters = (q: string, p: PaymentKey | "") => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p) params.set("payment", p);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  };

  useEffect(() => {
    if (debouncedQuery !== initialQuery) applyFilters(debouncedQuery, payment);
    // Solo reacciona al texto ya "asentado"; el select aplica por su cuenta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const clearFilters = () => {
    setQuery("");
    setPayment("");
    applyFilters("", "");
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters(query.trim(), payment);
      }}
      className={`mt-6 flex flex-wrap items-center gap-2 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por email..."
        aria-label="Buscar por email"
        className={`${filterClass} w-full max-w-sm`}
      />
      <select
        value={payment}
        onChange={(e) => {
          const next = e.target.value as PaymentKey | "";
          setPayment(next);
          applyFilters(query.trim(), next);
        }}
        aria-label="Filtrar por pago"
        className={`${filterClass} bg-white`}
      >
        <option value="">Todos los pagos</option>
        {PAYMENT_KEYS.map((key) => (
          <option key={key} value={key}>
            {paymentBadge[key].label}
          </option>
        ))}
      </select>
      {(query || payment) && (
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
