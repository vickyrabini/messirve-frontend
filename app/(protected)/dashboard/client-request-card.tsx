"use client";

import { useActionState, useState } from "react";
import {
  requestClientRole,
  type ClientRequestState,
} from "@/app/actions/client-requests";
import { SunDecor } from "@/components/sun-decor";
import type { ClientRequestStatus } from "@/types/database";

type Props = {
  request: { status: ClientRequestStatus; message: string | null } | null;
};

const initialState: ClientRequestState = { error: null };

export function ClientRequestCard({ request }: Props) {
  const [state, formAction, isPending] = useActionState(
    requestClientRole,
    initialState,
  );
  const [retrying, setRetrying] = useState(false);

  if (request?.status === "pending") {
    return (
      <div className="mb-8 max-w-2xl rounded-2xl border border-gris/30 bg-white p-8">
        <h3 className="font-brand uppercase text-lg text-ink">
          ¿Querés ser cliente?
        </h3>
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-dorado/10 px-3 py-2 text-sm font-semibold text-dorado-dark">
          Tu solicitud está pendiente de revisión
        </p>
      </div>
    );
  }

  if (request?.status === "rejected" && !retrying) {
    return (
      <div className="mb-8 max-w-2xl rounded-2xl border border-gris/30 bg-white p-8">
        <h3 className="font-brand uppercase text-lg text-ink">
          ¿Querés ser cliente?
        </h3>
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">
          Tu solicitud fue rechazada
        </p>
        <button
          type="button"
          onClick={() => setRetrying(true)}
          className="mt-4 cursor-pointer rounded-xl border border-gris/40 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
        >
          Volver a solicitar
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-8 h-full">
      <SunDecor className="pointer-events-none absolute -bottom-24 right-0 h-[420px] w-[420px] opacity-10" />
      <div className="max-w-2xl">
        <div className="relative rounded-[20px] border border-gris/30 bg-white px-8 py-12 text-center sm:px-10">
          <SunDecor className="mx-auto mb-5 h-16 w-16" />
          <p className="mx-auto max-w-[420px] text-[17px] leading-relaxed text-muted">
            Todavía no tenés un servicio publicado. Sumate como emprendedor para
            aparecer en búsquedas y gestionar tu suscripción acá.
          </p>

          <form
            action={formAction}
            className="mx-auto mt-6 max-w-[420px] space-y-3 text-center"
          >
            <textarea
              name="message"
              rows={3}
              placeholder="Contanos sobre tu negocio (opcional)"
              className="w-full rounded-lg border border-gris/40 px-4 py-2.5 text-sm focus:border-celeste focus:outline-none focus:ring-2 focus:ring-celeste/30"
            />
            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-full bg-dorado px-8 py-4 font-brand text-[15px] uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-dorado-light disabled:opacity-60"
            >
              {isPending ? "Enviando..." : "Sumate como emprendedor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
