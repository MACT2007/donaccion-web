import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  ClipboardList,
  CreditCard,
  FileSearch,
  HandCoins,
  Package,
  Repeat,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo funciona DonAcción: donar dinero o artículos paso a paso" },
      {
        name: "description",
        content:
          "Del aporte a la entrega: cómo verificamos campañas, cómo donar dinero o artículos, qué recibes como donante y cómo rendimos cuentas.",
      },
      { property: "og:title", content: "Cómo funciona DonAcción" },
      {
        property: "og:description",
        content: "Verificación, donación, entrega y rendición de cuentas explicados paso a paso.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    icon: FileSearch,
    title: "Verificamos la campaña",
    text: "Revisamos la vigencia legal de la organización, su presupuesto y la lista de beneficiarios antes de publicar.",
  },
  {
    icon: HandCoins,
    title: "Eliges cómo aportar",
    text: "Dinero desde S/ 5, aporte mensual o donación en especie según lo que acepte cada campaña.",
  },
  {
    icon: CreditCard,
    title: "Registras tu donación",
    text: "Confirmas tus datos, decides si quieres aparecer o donar de forma anónima y listo.",
  },
  {
    icon: Truck,
    title: "Compramos y entregamos",
    text: "El equipo compra insumos, arma los kits con voluntarios y entrega en campo con acta firmada.",
  },
  {
    icon: ClipboardList,
    title: "Publicamos la rendición",
    text: "Cada campaña cierra con un informe de gastos y beneficiarios que cualquiera puede consultar.",
  },
  {
    icon: BadgeCheck,
    title: "Recibes tu certificado",
    text: "Queda disponible en tu panel junto al historial completo de tus donaciones.",
  },
];


function HowItWorks() {
  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Cómo funciona</p>
          <h1 className="animate-fade-up mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            De tu aporte a la entrega, sin cajas negras
          </h1>
          <p className="animate-fade-up mt-4 max-w-2xl opacity-80 [animation-delay:120ms]">
            Este es el recorrido completo de una donación en DonAcción, con los controles que aplicamos en cada etapa.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 80} as="li">
              <div className="surface lift h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="accent-panel grid size-11 place-items-center rounded-xl">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl font-bold text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-lg font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal className="surface p-8">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary text-accent">
              <HandCoins className="size-5" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">Donar dinero</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Monto libre desde S/ 5, con montos sugeridos por campaña.</li>
              <li>Opción de aporte mensual que puedes pausar cuando quieras.</li>
              <li>Certificado automático y avance de la campaña por correo.</li>
              <li>Si la campaña supera su meta, el excedente amplía la cobertura.</li>
            </ul>
            <Button asChild className="mt-6">
              <Link to="/campanas">Elegir una campaña</Link>
            </Button>
          </Reveal>

          <Reveal delay={120} className="surface p-8">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary text-accent">
              <Package className="size-5" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">Donar artículos</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Registra qué vas a donar y te confirmamos el punto de acopio.</li>
              <li>Ropa limpia y completa; alimentos sellados con 3 meses de vigencia.</li>
              <li>Medicinas sin abrir y con fecha vigente, en su empaque original.</li>
              <li>Recojo a domicilio para donaciones grandes o de empresas.</li>
            </ul>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/puntos-de-acopio">Ver puntos de acopio</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="surface flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center">
          <span className="accent-panel grid size-12 shrink-0 place-items-center rounded-2xl">
            <Repeat className="size-6" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">¿Tu organización quiere publicar una campaña?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Escríbenos con la documentación de tu institución y el proyecto. Verificamos y publicamos en un promedio
              de 10 días hábiles.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/contacto">Postular mi campaña</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
