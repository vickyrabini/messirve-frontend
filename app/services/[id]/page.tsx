import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/star-rating";
import { PLACEHOLDER_COLORS } from "@/components/service-card";
import { AuthNavActions } from "@/components/auth-nav-actions";
import { ReviewForm } from "./review-form";
import type { Service } from "@/types/database";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Public page, no session — same RLS situation as /search: services/likes/ratings/comments
  // are authenticated-only, so we read with the service-role client. Read-only, and only ever
  // exposes an is_active=true service (already meant for public display) plus aggregate counts.
  const admin = createAdminClient();
  const { data: service } = await admin
    .from("services")
    .select("*, categories(name, slug, emoji)")
    .eq("id", id)
    .eq("is_active", true)
    .single<
      Service & {
        categories: { name: string; slug: string; emoji: string | null } | null;
      }
    >();

  if (!service) {
    notFound();
  }

  const [{ data: likes }, { data: ratings }, { data: comments }] =
    await Promise.all([
      admin.from("service_likes").select("id").eq("service_id", id),
      admin
        .from("service_ratings")
        .select("user_id, stars")
        .eq("service_id", id),
      admin
        .from("service_comments")
        .select("id, user_id, content, created_at")
        .eq("service_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const commenterIds = (comments ?? []).map((c) => c.user_id);
  const { data: profiles } =
    commenterIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, full_name")
          .in("id", commenterIds)
      : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const ratingByUser = new Map(
    (ratings ?? []).map((r) => [r.user_id, r.stars]),
  );

  const totalRatings = ratings?.length ?? 0;
  const avgRating =
    totalRatings > 0
      ? (ratings ?? []).reduce((acc, r) => acc + r.stars, 0) / totalRatings
      : 0;
  const totalLikes = likes?.length ?? 0;

  // Session check only decides which block renders below — this page stays public either way.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const myComment = user
    ? (comments ?? []).find((c) => c.user_id === user.id)
    : undefined;

  const category = service.categories;
  const [from, to] = PLACEHOLDER_COLORS[category?.slug ?? ""] ?? [
    "#72A2E0",
    "#4A9FD4",
  ];
  const photo = service.photos?.[0];

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gris/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/">
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

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted transition-colors hover:text-ink"
        >
          <span>←</span> Volver a la búsqueda
        </Link>

        <div className="mt-5 flex flex-col gap-6 sm:flex-row">
          <div className="w-full overflow-hidden rounded-3xl sm:w-1/3">
            <div className="relative w-full aspect-[4/3] max-h-[250px]">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${from}, ${to})`,
                  }}
                >
                  <span className="text-7xl opacity-60">
                    {category?.emoji ?? "🏷️"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full sm:w-2/3">
            {category?.name && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-celeste/10 px-3 py-1 text-[13px] font-bold text-celeste-deep">
                {category.emoji} {category.name}
              </span>
            )}
            <h1 className="mt-3 font-brand uppercase text-3xl text-ink sm:text-4xl">
              {service.name}
            </h1>
            <div className="mt-2 flex flex-wrap flex-col items-start gap-1">
              <StarRating value={avgRating} size={18} />
              <span className="text-[15px] font-semibold text-ink">
                {totalRatings > 0 ? avgRating.toFixed(1) : "Sin reseñas aún"}
              </span>
              {totalRatings > 0 && (
                <span className="text-[14px] text-muted">
                  · {totalRatings} reseña{totalRatings !== 1 ? "s" : ""}
                </span>
              )}
              <span className="text-[14px] text-muted">
                · {totalLikes} favorito{totalLikes !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {service.description && (
          <p className="mt-6 max-w-3xl text-[16px] leading-relaxed text-[#43413B]">
            {service.description}
          </p>
        )}

        {/* Contacto */}
        <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-gris/40 bg-white p-6 sm:grid-cols-2">
          {service.address && (
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-muted">
                Dirección
              </p>
              <p className="mt-1 text-[15px] text-ink">
                {service.address}, {service.city}
              </p>
            </div>
          )}
          {service.price_info && (
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-muted">
                Precio
              </p>
              <p className="mt-1 text-[15px] text-ink">{service.price_info}</p>
            </div>
          )}
          {service.phone && (
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-muted">
                Teléfono
              </p>
              <p className="mt-1 text-[15px] text-ink">{service.phone}</p>
            </div>
          )}
          {service.website && (
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-muted">
                Sitio web
              </p>
              <a
                href={service.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-[15px] text-celeste-deep hover:underline"
              >
                {service.website}
              </a>
            </div>
          )}
          {service.instagram && (
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-muted">
                Instagram
              </p>
              <p className="mt-1 text-[15px] text-ink">{service.instagram}</p>
            </div>
          )}
        </div>

        {/* Reseñas */}
        <div className="mt-10">
          <h2 className="font-brand uppercase text-xl text-ink">Reseñas</h2>
          {(comments ?? []).length === 0 ? (
            <p className="mt-3 text-[15px] text-muted">
              Todavía no hay reseñas para este servicio.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {(comments ?? []).map((c) => (
                <div
                  key={c.id}
                  className="rounded-[18px] border border-gris/40 bg-white px-6 py-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-celeste font-brand text-white">
                      {(nameById.get(c.user_id) ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-ink">
                        {nameById.get(c.user_id) ?? "Usuario"}
                      </p>
                      <p className="text-[13px] text-muted">
                        {formatDate(c.created_at)}
                      </p>
                    </div>
                    {ratingByUser.has(c.user_id) && (
                      <StarRating
                        value={ratingByUser.get(c.user_id)!}
                        size={14}
                      />
                    )}
                  </div>
                  <p className="mt-3 text-[15px] italic leading-relaxed text-[#43413B]">
                    &quot;{c.content}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <ReviewForm
          serviceId={service.id}
          initialStars={user ? (ratingByUser.get(user.id) ?? null) : null}
          initialComment={myComment?.content ?? ""}
          isAuthenticated={!!user}
        />
      </main>
    </div>
  );
}
