import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleServiceActive, approveService } from "@/app/actions/admin";
import { Pagination } from "@/components/pagination";
import { AdminListFilters } from "@/components/admin-list-filters";
import { escapeLike } from "@/lib/escape-like";
import {
  PAYMENT_KEYS,
  isPaymentKey,
  paymentBadge,
  type PaymentKey,
} from "./payment-status";
import { AdminPageContainer } from "../admin-page-container";

const PAYMENT_OPTIONS = PAYMENT_KEYS.map((key) => ({
  value: key,
  label: paymentBadge[key].label,
}));

// "Sin rubro" sirve para encontrar rápido los servicios a los que falta asignarles uno.
const RUBRO_OPTIONS = [
  { value: "with", label: "Con rubro" },
  { value: "without", label: "Sin rubro" },
];
type RubroFilter = "with" | "without";
const isRubroFilter = (v: string | undefined): v is RubroFilter =>
  v === "with" || v === "without";

const PAGE_SIZE = 10;

// Fila de public.admin_services_view (supabase/migrations/20261030000300_admin_services_view_subcategory.sql)
type AdminServiceRow = {
  id: string;
  name: string;
  is_active: boolean;
  approved: boolean;
  user_id: string | null;
  category_name: string | null;
  category_emoji: string | null;
  email: string | null;
  payment_key: PaymentKey | null;
  subcategory_id: string | null;
  subcategory_name: string | null;
};

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    payment?: string;
    rubro?: string;
  }>;
}) {
  const {
    page: pageParam,
    q,
    payment: paymentParam,
    rubro: rubroParam,
  } = await searchParams;
  const query = q?.trim() ?? "";
  const payment = isPaymentKey(paymentParam) ? paymentParam : null;
  const rubro = isRubroFilter(rubroParam) ? rubroParam : null;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // La vista ya trae email y estado de pago, así que filtro y paginación los resuelve la base.
  const admin = createAdminClient();
  let request = admin
    .from("admin_services_view")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (query) request = request.ilike("email", `%${escapeLike(query)}%`);
  if (payment) request = request.eq("payment_key", payment);
  if (rubro === "with") request = request.not("subcategory_id", "is", null);
  if (rubro === "without") request = request.is("subcategory_id", null);
  const { data, count } = await request.returns<AdminServiceRow[]>();

  const pageRows = (data ?? []).map((s) => ({
    ...s,
    categories: s.category_name
      ? { name: s.category_name, emoji: s.category_emoji }
      : null,
    // Un servicio con dueño cuyo usuario ya no existe en auth muestra "—"
    email: s.user_id ? (s.email ?? "—") : null,
    paymentKey: s.payment_key,
  }));

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const hasFilters = !!query || !!payment || !!rubro;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (payment) params.set("payment", payment);
    if (rubro) params.set("rubro", rubro);
    params.set("page", String(p));
    return `/admin/services?${params.toString()}`;
  };

  return (
    <AdminPageContainer size="wide">
      <h1 className="font-brand uppercase text-2xl text-ink">
        Gestionar servicios
      </h1>
      <p className="mt-1 text-sm text-muted">
        Activá los servicios pendientes de revisión o desactivá los publicados
      </p>

      <AdminListFilters
        basePath="/admin/services"
        searchPlaceholder="Buscar por email..."
        selects={[
          {
            param: "payment",
            label: "Filtrar por pago",
            allLabel: "Todos los pagos",
            options: PAYMENT_OPTIONS,
            initial: payment,
          },
          {
            param: "rubro",
            label: "Filtrar por rubro",
            allLabel: "Todos los rubros",
            options: RUBRO_OPTIONS,
            initial: rubro,
          },
        ]}
        initialQuery={q?.trim() ?? ""}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gris/30 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-gris/30 bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Creado por</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gris/20 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-ink">
                    <span className="block max-w-[200px] truncate" title={s.name}>
                      {s.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="block max-w-[180px] truncate" title={s.categories?.name}>
                      {s.categories
                        ? `${s.categories.emoji ? `${s.categories.emoji} ` : ""}${s.categories.name}`
                        : "—"}
                    </span>
                    {s.subcategory_name ? (
                      <span
                        className="mt-0.5 block max-w-[180px] truncate text-xs text-ink/70"
                        title={s.subcategory_name}
                      >
                        {s.subcategory_name}
                      </span>
                    ) : (
                      <span className="mt-1 inline-block rounded-full bg-dorado/10 px-2 py-0.5 text-[11px] font-semibold text-dorado-dark">
                        Sin rubro
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="block max-w-[200px] truncate" title={s.email ?? undefined}>
                      {s.email ?? "Admin (panel)"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.paymentKey === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentBadge[s.paymentKey].className}`}
                      >
                        {paymentBadge[s.paymentKey].label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.is_active
                          ? "bg-celeste/10 text-celeste-deep"
                          : "bg-dorado/10 text-dorado-dark"
                      }`}
                    >
                      {s.is_active ? "Activo" : "Desactivado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/services/${s.id}/edit`}
                        className="rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                      >
                        Editar
                      </Link>
                      {!s.approved && (
                        <form action={approveService}>
                          <input type="hidden" name="serviceId" value={s.id} />
                          <button
                            type="submit"
                            className="cursor-pointer rounded-full border border-celeste bg-celeste/10 px-3.5 py-1.5 text-xs font-semibold text-celeste-deep transition-colors hover:bg-celeste/20"
                          >
                            Aprobar
                          </button>
                        </form>
                      )}
                      <form action={toggleServiceActive}>
                        <input type="hidden" name="serviceId" value={s.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={String(s.is_active)}
                        />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
                        >
                          {s.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageRows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">
            {hasFilters
              ? "No se encontraron servicios"
              : "No hay servicios cargados"}
          </p>
        )}

        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </AdminPageContainer>
  );
}
