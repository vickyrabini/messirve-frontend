"use client";

import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {logout} from "@/app/actions/auth";
import {ExplorarTab} from "./explorar-tab";
import {FavoritosTab} from "./favoritos-tab";
import {ResenasTab, type ReviewItem} from "./resenas-tab";
import {SuscripcionTab} from "./suscripcion-tab";
import {PerfilTab} from "./perfil-tab";
import type {
  Category,
  ServiceWithStats,
  SubscriptionStatus,
} from "@/types/database";

type Tab = "explorar" | "favoritos" | "resenas" | "suscripcion" | "perfil";

const TABS: {id: Tab; label: string; icon: React.ReactNode}[] = [
  {
    id: "explorar",
    label: "Explorar",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <circle cx={11} cy={11} r={7} />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    ),
  },
  {
    id: "favoritos",
    label: "Favoritos",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path d="M12 21s-7-4.5-9.5-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
      </svg>
    ),
  },
  {
    id: "resenas",
    label: "Mis reseñas",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <polygon points="12,3 14.5,9 21,9.3 16,13.5 17.7,20 12,16.3 6.3,20 8,13.5 3,9.3 9.5,9" />
      </svg>
    ),
  },
  {
    id: "suscripcion",
    label: "Suscripción",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <rect x={4} y={5} width={16} height={14} rx={2} />
        <path d="M4 10h16" />
        <path d="M8 15h4" />
      </svg>
    ),
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <circle cx={12} cy={8} r={4} />
        <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
];

const TAB_TITLES: Record<Tab, string> = {
  explorar: "Explorar",
  favoritos: "Favoritos",
  resenas: "Mis reseñas",
  suscripcion: "Suscripción",
  perfil: "Perfil",
};

type Props = {
  fullName: string;
  email: string;
  memberSince: string;
  isAdmin: boolean;
  role: "admin" | "client" | "user";
  categories: Category[];
  exploreServices: ServiceWithStats[];
  favoriteServices: ServiceWithStats[];
  reviews: ReviewItem[];
  ownService: {
    id: string;
    name: string;
    is_active: boolean;
    suspended_for_nonpayment: boolean;
  } | null;
  checkoutStatus: "success" | "cancel" | null;
  paymentUpdateStatus: "success" | "cancel" | null;
  cancellationStatus: "success" | null;
  subscription: {
    amount: number | null;
    currency: string | null;
    current_period_end: string | null;
    status: SubscriptionStatus | null;
  } | null;
};

export function DashboardShell({
  fullName,
  email,
  memberSince,
  isAdmin,
  role,
  categories,
  exploreServices,
  favoriteServices,
  reviews,
  ownService,
  checkoutStatus,
  paymentUpdateStatus,
  cancellationStatus,
  subscription,
}: Props) {
  const [tab, setTab] = useState<Tab>(
    checkoutStatus || paymentUpdateStatus || cancellationStatus
      ? "suscripcion"
      : "explorar",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initial = (fullName || email).charAt(0).toUpperCase();

  return (
    <div className="relative flex h-screen overflow-hidden bg-cream">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-[266px] shrink-0 flex-col bg-celeste-deep px-5 py-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="self-start">
            <Image
              src="/messirve-logo.png"
              alt="Messirve"
              width={138}
              height={64}
              className="h-14 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-white/70 transition-colors hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="mt-9 flex flex-col gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
                tab === t.id
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:text-white/85"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white/55 transition-colors hover:text-white/85"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />
              </svg>
              Panel de administración
            </Link>
          )}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-1.5 py-2">
            <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-celeste font-brand text-lg text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-white">
                {fullName || "Sin nombre"}
              </p>
              <p className="truncate text-[13px] text-white/50">{email}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="mt-1.5 flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-1.5 py-2.5 text-[14.5px] font-semibold text-white/55 transition-colors hover:text-white/85"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path d="M15 4h4v16h-4" />
                <path d="M10 8l-4 4 4 4" />
                <path d="M6 12h9" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-[78px] shrink-0 items-center gap-3 justify-between border-b border-gris/40 bg-cream/90 px-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="text-ink lg:hidden"
              aria-label="Abrir menú"
            >
              <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <h1 className="font-brand text-2xl uppercase text-ink">
              {TAB_TITLES[tab]}
            </h1>
          </div>
        </header>

        <div
          className="flex-1 overflow-y-auto px-8 py-9"
          style={{ maxWidth: "1240px" }}
        >
          {tab === "explorar" && (
            <ExplorarTab
              fullName={fullName}
              categories={categories}
              services={exploreServices}
            />
          )}
          {tab === "favoritos" && <FavoritosTab services={favoriteServices} />}
          {tab === "resenas" && <ResenasTab reviews={reviews} />}
          {tab === "suscripcion" && (
            <SuscripcionTab
              role={role}
              ownService={ownService}
              checkoutStatus={checkoutStatus}
              paymentUpdateStatus={paymentUpdateStatus}
              cancellationStatus={cancellationStatus}
              subscription={subscription}
            />
          )}
          {tab === "perfil" && (
            <PerfilTab
              fullName={fullName}
              email={email}
              memberSince={memberSince}
            />
          )}
        </div>
      </main>
    </div>
  );
}
