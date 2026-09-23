import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Handshake, Target, Users } from "lucide-react";
import heroImage from "@/assets/hero-donaccion.jpg";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Quiénes somos | DonAcción" },
      {
        name: "description",
        content:
          "Somos una asociación sin fines de lucro que conecta donantes con organizaciones verificadas en seis regiones del Perú.",
      },
      { property: "og:title", content: "Quiénes somos | DonAcción" },
      {
        property: "og:description",
        content: "Nuestra historia, equipo, aliados y la forma en que trabajamos con las comunidades.",
      },
    ],
  }),
  component: AboutPage,
});

const HITOS = [
  { year: "2019", text: "Nace DonAcción con una campaña de frazadas para 120 familias en Puno." },
  { year: "2021", text: "Abrimos los tres primeros puntos de acopio permanentes y la red de voluntarios." },
  { year: "2023", text: "Consolidamos la red en seis regiones y publicamos el primer tablero de campañas." },
  { year: "2024", text: "Primera auditoría externa independiente de estados financieros." },
  { year: "2025", text: "48.200 personas beneficiadas y 24 campañas cerradas con informe público." },
];

function AboutPage() {
  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Nosotros</p>
            <h1 className="animate-fade-up mt-3 font-display text-4xl font-bold sm:text-5xl">
              Somos el puente entre quien quiere ayudar y quien lo necesita
            </h1>
            <p className="animate-fade-up mt-4 opacity-80 [animation-delay:120ms]">
              DonAcción es una asociación sin fines de lucro creada en 2025. Trabajamos con comedores populares,
              colegios rurales, postas médicas y redes vecinales para convertir donaciones en entregas verificadas.
            </p>
          </div>
          <img
            src={heroImage}
            alt="Equipo de DonAcción en una entrega comunitaria"
            loading="lazy"
            width={1600}
            height={1104}
            className="animate-scale-in rounded-3xl object-cover shadow-[var(--shadow-lift)]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Misión",
              text: "Facilitar donaciones útiles, rápidas y verificables para comunidades en situación de vulnerabilidad.",
            },
            {
              icon: Compass,
              title: "Visión",
              text: "Ser la plataforma de referencia en donaciones trazables en América Latina hacia 2030.",
            },
            {
              icon: Handshake,
              title: "Principios",
              text: "Dignidad de las personas, priorización técnica de necesidades y rendición de cuentas sin excusas.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <div className="surface h-full p-6">
                <span className="accent-panel grid size-11 place-items-center rounded-xl">
                  <item.icon className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold">Nuestra historia</h2>
        <ol className="mt-8 space-y-0">
          {HITOS.map((hito, i) => (
            <Reveal key={hito.year} delay={i * 70} as="li">
              <div className="flex gap-6 border-l-2 border-border pb-8 pl-6 last:pb-0">
                <div>
                  <p className="font-display text-xl font-bold text-accent">{hito.year}</p>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{hito.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "48.200", label: "Personas beneficiadas en 2025" },
            { value: "24", label: "Campañas cerradas con informe" },
            { value: "312", label: "Voluntarios activos" },
            { value: "38", label: "Organizaciones aliadas" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="surface p-6">
                <p className="font-display text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="surface mt-16 flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center">
          <span className="accent-panel grid size-12 shrink-0 place-items-center rounded-2xl">
            <Users className="size-6" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">Sumemos a tu empresa u organización</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Convenios de donación corporativa, voluntariado empresarial y campañas de recaudación conjunta.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/contacto">Conversemos</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
