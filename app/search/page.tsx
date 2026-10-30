import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ServiceCard } from "@/components/service-card";
import { Pagination } from "@/components/pagination";
import { AuthNavActions } from "@/components/auth-nav-actions";
import { RubroFilterList } from "./rubro-filter-list";
import { MobileFilterChips } from "./mobile-filter-chips";
import type { Category, ServiceWithStats } from "@/types/database";

const PAGE_SIZE = 12;

// PostgREST's .or() filter string uses "," to separate conditions and "()" for
// grouping — a raw search term containing those would corrupt the expression.
function sanitizeForFilter(value: string) {
  return value.replace(/[(),]/g, " ").trim();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    rubro?: string;
    page?: string;
  }>;
}) {
  const { q, categoria, rubro, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Public page, no session — services/likes/ratings RLS is authenticated-only,
  // so we read with the service-role client. Read-only, and only ever exposes
  // is_active=true rows (already meant for public display) plus aggregate counts.
  const admin = createAdminClient();
  const { data: categoriesData } = await admin
    .from("categories")
    .select("id, name, slug, emoji, order, created_at")
    .order("order", { ascending: true });
  const categories: Category[] = categoriesData ?? [];
  const activeCategory = categories.find((c) => c.slug === categoria);

  // Rubros solo de la categoría activa; el rubro de la URL se ignora si no pertenece a ella.
  const [{ data: rubrosData }, { data: categoryServicesData }] = activeCategory
    ? await Promise.all([
        admin
          .from("subcategories")
          .select("id, name, slug")
          .eq("category_id", activeCategory.id)
          .order("order")
          .order("name"),
        // Conteo por rubro en UNA consulta, agrupado en memoria (la lista puede ser larga).
        admin
          .from("services")
          .select("subcategory_id")
          .eq("is_active", true)
          .eq("category_id", activeCategory.id),
      ])
    : [{ data: [] }, { data: [] }];
  const rubroCounts = new Map<string, number>();
  for (const s of categoryServicesData ?? []) {
    if (s.subcategory_id)
      rubroCounts.set(s.subcategory_id, (rubroCounts.get(s.subcategory_id) ?? 0) + 1);
  }
  const activeRubro = (rubrosData ?? []).find((r) => r.slug === rubro);
  // Solo rubros con servicios publicados (la lista completa tiene cientos, casi todos
  // vacíos); el activo se mantiene aunque quede en 0 para que el filtro siga visible.
  const rubros = (rubrosData ?? []).filter(
    (r) => (rubroCounts.get(r.id) ?? 0) > 0 || r.id === activeRubro?.id,
  );

  let servicesQuery = admin
    .from("services")
    .select("*, categories(name, slug, emoji), subcategories(name, slug)", {
      count: "exact",
    })
    .eq("is_active", true);

  if (activeCategory)
    servicesQuery = servicesQuery.eq("category_id", activeCategory.id);
  if (activeRubro)
    servicesQuery = servicesQuery.eq("subcategory_id", activeRubro.id);

  const safeQuery = sanitizeForFilter(query);
  if (safeQuery)
    servicesQuery = servicesQuery.or(
      `name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`,
    );

  const { data: servicesData, count } = await servicesQuery.range(from, to);
  const totalResults = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  const serviceIds = (servicesData ?? []).map((s) => s.id);

  const [{ data: allLikes }, { data: allRatings }, ...categoryCountResults] =
    await Promise.all([
      serviceIds.length > 0
        ? admin
            .from("service_likes")
            .select("service_id")
            .in("service_id", serviceIds)
        : Promise.resolve({ data: [] }),
      serviceIds.length > 0
        ? admin
            .from("service_ratings")
            .select("service_id, stars")
            .in("service_id", serviceIds)
        : Promise.resolve({ data: [] }),
      // Sidebar counts must reflect ALL active services per category, independent of the
      // current search/page — a lightweight head-only count query per category.
      ...categories.map((c) =>
        admin
          .from("services")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true)
          .eq("category_id", c.id),
      ),
    ]);

  const categoryCounts = new Map<string, number>(
    categories.map((c, i) => [c.slug, categoryCountResults[i]?.count ?? 0]),
  );
  const { count: totalActiveCount } = await admin
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const results: ServiceWithStats[] = (servicesData ?? []).map((s) => {
    const sRatings = (allRatings ?? []).filter((r) => r.service_id === s.id);
    const avg =
      sRatings.length > 0
        ? sRatings.reduce((acc, r) => acc + r.stars, 0) / sRatings.length
        : 0;
    return {
      ...s,
      avg_rating: avg,
      total_ratings: sRatings.length,
      total_likes: (allLikes ?? []).filter((l) => l.service_id === s.id).length,
      user_liked: false,
      user_rating: null,
    };
  });

  const buildHref = (params: {
    q?: string;
    categoria?: string;
    rubro?: string;
    page?: number;
  }) => {
    const usp = new URLSearchParams();
    if (params.q) usp.set("q", params.q);
    if (params.categoria) usp.set("categoria", params.categoria);
    if (params.categoria && params.rubro) usp.set("rubro", params.rubro);
    if (params.page && params.page > 1) usp.set("page", String(params.page));
    const qs = usp.toString();
    return qs ? `/search?${qs}` : "/search";
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gris/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href={user ? "/dashboard" : "/"}>
            <Image
              src="/messirve-logo.png"
              alt="Messirve Barcelona"
              width={120}
              height={44}
              className="h-10 w-auto"
            />
          </Link>
          <AuthNavActions isAuthenticated={!!user} />
        </div>
      </header>

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-celeste py-14 sm:py-16">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-dorado/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <h1 className="font-brand uppercase text-3xl leading-none text-white sm:text-[42px]">
            Buscá servicios en Barcelona
          </h1>
          <p className="mt-3 max-w-xl text-[17px] text-white/90">
            Todo lo nuestro: reseñado, valorado y recomendado por la comunidad.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-gris/40 bg-white p-6 shadow-card">
              <form
                action="/search"
                method="get"
                className="flex flex-col gap-3"
              >
                {categoria && (
                  <input type="hidden" name="categoria" value={categoria} />
                )}
                {activeRubro && (
                  <input type="hidden" name="rubro" value={activeRubro.slug} />
                )}
                <label
                  htmlFor="q"
                  className="text-[14px] font-semibold text-ink"
                >
                  Buscar
                </label>
                <div className="flex items-center gap-2.5 rounded-full border border-gris/50 bg-cream px-4 py-2.5">
                  <svg
                    width={18}
                    height={18}
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
                    id="q"
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Empanadas, gestor…"
                    className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-celeste-deep px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15212F]"
                >
                  Buscar
                </button>
              </form>

              {/* En mobile los filtros van como chips arriba de los resultados (MobileFilterChips) */}
              <div className="mt-7 hidden border-t border-gris/30 pt-6 lg:block">
                <p className="text-[13px] font-bold uppercase tracking-wide text-muted">
                  Categorías
                </p>
                <nav className="mt-3 flex flex-col gap-1">
                  <Link
                    href={buildHref({ q: query })}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
                      !categoria
                        ? "bg-celeste/10 text-celeste-deep"
                        : "text-ink hover:bg-cream"
                    }`}
                  >
                    Todas
                    <span className="text-[13px] font-bold text-muted">
                      {totalActiveCount ?? 0}
                    </span>
                  </Link>
                  {categories.map((c) => (
                    <div key={c.id}>
                      <Link
                        href={buildHref({ q: query, categoria: c.slug })}
                        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
                          categoria === c.slug
                            ? "bg-celeste/10 text-celeste-deep"
                            : "text-ink hover:bg-cream"
                        }`}
                      >
                        <span className="min-w-0">{c.name}</span>
                        <span className="shrink-0 text-[13px] font-bold text-muted">
                          {categoryCounts.get(c.slug) ?? 0}
                        </span>
                      </Link>
                      {activeCategory?.id === c.id && rubros.length > 0 && (
                        <RubroFilterList
                          rubros={rubros}
                          counts={rubroCounts}
                          activeRubro={activeRubro?.slug}
                          totalInCategory={categoryCounts.get(c.slug) ?? 0}
                          buildRubroHref={(r) =>
                            buildHref({ q: query, categoria: c.slug, rubro: r })
                          }
                        />
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <div className="min-w-0">
            <MobileFilterChips
              categories={categories}
              activeCategory={activeCategory?.slug}
              rubros={rubros}
              activeRubro={activeRubro?.slug}
              buildCategoryHref={(c) => buildHref({ q: query, categoria: c })}
              buildRubroHref={(r) =>
                buildHref({ q: query, categoria: activeCategory?.slug, rubro: r })
              }
            />
            <p className="mt-4 text-[15px] text-muted lg:mt-0">
              {activeCategory ? (
                <>
                  {" "}
                  en <strong className="text-ink">{activeCategory.name}</strong>
                  {activeRubro ? (
                    <>
                      {" "}
                      › <strong className="text-ink">{activeRubro.name}</strong>
                    </>
                  ) : null}
                </>
              ) : null}
              {query ? (
                <>
                  {" "}
                  para <strong className="text-ink">&quot;{query}&quot;</strong>
                </>
              ) : null}
            </p>

            {results.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-gris/40 bg-white p-10 text-center">
                <p className="text-4xl">🔍</p>
                <p className="mt-3 text-[15px] font-semibold text-ink">
                  No encontramos nada con esos filtros
                </p>
                <p className="mt-1 text-sm text-muted">
                  Probá con otra palabra o categoría
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-gris/30 bg-white">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    buildHref={(p) =>
                      buildHref({
                        q: query,
                        categoria,
                        rubro: activeRubro?.slug,
                        page: p,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {!user && (
          <p className="mt-12 text-center text-[14px] text-muted">
            <Link
              href="/login"
              className="font-semibold text-celeste-deep hover:underline"
            >
              Iniciá sesión
            </Link>{" "}
            para guardar favoritos y dejar reseñas.
          </p>
        )}
      </main>
    </div>
  );
}
