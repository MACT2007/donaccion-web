import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Package, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/donaccion";
import type { DropOffPoint } from "@/lib/types";

export const Route = createFileRoute("/puntos-de-acopio")({
  head: () => ({
    meta: [
      { title: "Puntos de acopio: dónde entregar tus donaciones | DonAcción" },
      {
        name: "description",
        content:
          "Direcciones, horarios y teléfonos de los puntos de acopio de DonAcción, además de las reglas para preparar tu donación.",
      },
      { property: "og:title", content: "Puntos de acopio | DonAcción" },
      { property: "og:description", content: "Seis sedes para dejar ropa, alimentos, útiles y más, con recojo a domicilio." },
    ],
  }),
  component: DropOffPage,
});

function DropOffPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["drop-off-points"],
    queryFn: async () => {
      const { data } = await supabase.from("drop_off_points").select("*").order("city");
      return (data ?? []) as DropOffPoint[];
    },
  });

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Puntos de acopio</p>
          <h1 className="animate-fade-up mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Deja tu donación cerca de casa
          </h1>
          <p className="animate-fade-up mt-4 max-w-2xl opacity-80 [animation-delay:120ms]">
            Puedes acercarte sin cita previa en horario de atención. Para volúmenes grandes o donaciones de empresas
            coordinamos el recojo.
          </p>
          <Button asChild variant="secondary" className="mt-7 gap-1.5">
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">
              <Truck className="size-4" /> Coordinar un recojo
            </a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((point, i) => (
              <Reveal key={point.id} delay={i * 80}>
                <article className="surface lift h-full p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{point.city}</p>
                  <h2 className="mt-1.5 font-display text-lg font-semibold">{point.name}</h2>
                  <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0" /> {point.address}
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="mt-0.5 size-4 shrink-0" /> {point.hours}
                    </li>
                    {point.phone && (
                      <li className="flex items-start gap-2">
                        <Phone className="mt-0.5 size-4 shrink-0" /> {point.phone}
                      </li>
                    )}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <Reveal className="surface p-8">
            <span className="accent-panel grid size-11 place-items-center rounded-xl">
              <Package className="size-5" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">Cómo preparar tu donación</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Ropa limpia, sin roturas y clasificada por talla o edad.</li>
              <li>Alimentos sellados con al menos 3 meses antes de vencer.</li>
              <li>Medicinas en su empaque original, sin abrir y con fecha vigente.</li>
              <li>Juguetes completos y en buen estado, sin piezas faltantes.</li>
              <li>Equipos electrónicos funcionando, con cargador si corresponde.</li>
              <li>Rotula las cajas con el contenido para acelerar la clasificación.</li>
            </ul>
          </Reveal>
          <Reveal delay={120} className="surface p-8">
            <h2 className="font-display text-2xl font-bold">Lo que no podemos recibir</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Medicamentos vencidos, abiertos o sin empaque.</li>
              <li>Alimentos preparados o refrigerados.</li>
              <li>Colchones y muebles con daño estructural.</li>
              <li>Ropa interior usada y calzado sin par.</li>
              <li>Material inflamable, químicos o residuos peligrosos.</li>
            </ul>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/preguntas-frecuentes">Ver más detalles</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
