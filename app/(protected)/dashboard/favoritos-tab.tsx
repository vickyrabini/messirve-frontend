import { ServiceCard } from "@/components/service-card";
import type { ServiceWithStats } from "@/types/database";

type Props = {
  services: ServiceWithStats[];
};

export function FavoritosTab({ services }: Props) {
  return (
    <div>
      <p className="mb-6 text-[16px] text-muted">
        {services.length} servicio{services.length !== 1 ? "s" : ""} guardado
        {services.length !== 1 ? "s" : ""}. Los que ya te marcaron los tuyos.
      </p>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-gris/40 bg-white p-10 text-center">
          <p className="text-4xl">💛</p>
          <p className="mt-3 text-[15px] font-semibold text-ink">
            Aún no tenés favoritos
          </p>
          <p className="mt-1 text-sm text-muted">
            Explorá los servicios y agregá los que más te gusten
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
