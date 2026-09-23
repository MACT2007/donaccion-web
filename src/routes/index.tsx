import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  HandHeart,
  HeartHandshake,
  MapPin,
  PackageCheck,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import heroImage from "@/assets/hero-donaccion.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/CampaignCard";
import { CategoryCard } from "@/components/CategoryCard";
import { CountUp, Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/donaccion";
import type { CampaignWithCategory, Category, Testimonial, TransparencyReport } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DonAcción — Dona ropa, alimentos y más con total transparencia" },
      {
        name: "description",
        content:
          "Elige una campaña verificada, dona dinero o artículos y sigue el impacto de tu aporte. Ropa, alimentos, salud, educación, higiene, hogar y tecnología.",
      },
      { property: "og:title", content: "DonAcción — Donaciones con transparencia" },
      {
        property: "og:description",
        content: "Campañas verificadas con metas públicas, puntos de acopio en 6 regiones y rendición de cuentas.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const [campaigns, categories, testimonials, reports] = await Promise.all([
        supabase
          .from("campaigns")
          .select("*, categories(name, slug, accent)")
          .eq("status", "activa")
          .order("is_urgent", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(6),
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("testimonials").select("*").order("sort_order"),
        supabase.from("transparency_reports").select("*").order("year", { ascending: false }).limit(1),
      ]);
      return {
        campaigns: (campaigns.data ?? []) as CampaignWithCategory[],
        categories: (categories.data ?? []) as Category[],
        testimonials: (testimonials.data ?? []) as Testimonial[],
        report: (reports.data?.[0] ?? null) as TransparencyReport | null,
      };
    },
  });

  const campaigns = data?.campaigns ?? [];
  const categories = data?.categories ?? [];
  const testimonials = data?.testimonials ?? [];
  const report = data?.report;

  const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.raised_amount), 0);
  const totalDonors = campaigns.reduce((acc, c) => acc + c.donors_count, 0);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="ink-panel grain absolute inset-0 -z-10" />
        <div className="absolute -left-24 top-10 -z-10 size-72 rounded-full bg-accent/25 blur-3xl animate-float" />
        <div className="absolute -right-16 bottom-0 -z-10 size-80 rounded-full bg-chart-3/20 blur-3xl animate-float [animation-delay:1.5s]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="text-ink-foreground">
            <Badge className="animate-fade-in gap-1.5 border-0 bg-ink-foreground/12 text-ink-foreground">
              <Sparkles className="size-3.5" /> {campaigns.length} campañas verificadas ahora mismo
            </Badge>
            <h1 className="animate-fade-up mt-5 font-display text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Donar deja de ser un acto <span className="text-chart-3">a ciegas</span>.
            </h1>
            <p className="animate-fade-up mt-5 max-w-xl text-base opacity-80 sm:text-lg [animation-delay:120ms]">
              En DonAcción cada campaña muestra su meta, lo recaudado y su rendición de cuentas. Dona dinero o
              artículos —ropa, alimentos, medicinas, útiles— y sigue el recorrido de tu aporte.
            </p>

            <div className="animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:220ms]">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/campanas">
                  Explorar campañas <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-ink-foreground/25 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Link to="/como-funciona">Cómo funciona</Link>
              </Button>
            </div>

            <dl className="animate-fade-up mt-12 grid grid-cols-3 gap-6 border-t border-ink-foreground/15 pt-8 [animation-delay:320ms]">
              <div>
                <dt className="text-xs uppercase tracking-wide opacity-60">Recaudado activo</dt>
                <dd className="font-display text-2xl font-bold">
                  <CountUp value={totalRaised} format={(n) => money(n, true)} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide opacity-60">Donantes</dt>
                <dd className="font-display text-2xl font-bold">
                  <CountUp value={totalDonors} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide opacity-60">Beneficiarios 2025</dt>
                <dd className="font-display text-2xl font-bold">
                  <CountUp value={report?.total_beneficiaries ?? 1000} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
              <img
                src={heroImage}
                alt="Voluntarias de DonAcción entregando una caja de frazadas a una familia"
                width={1600}
                height={1104}
                className="animate-scale-in size-full object-cover"
              />
            </div>
            <div className="surface animate-fade-up absolute -bottom-6 left-4 w-64 p-4 [animation-delay:420ms] sm:left-8">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <PackageCheck className="size-4 text-success" /> Entrega verificada
              </p>
              <p className="mt-1.5 font-display text-sm font-semibold">Cajamarca · 412 kits de abrigo entregados</p>
              <p className="mt-1 text-xs text-muted-foreground">Acta firmada por la posta médica local.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: ShieldCheck, title: "Campañas verificadas", text: "Revisamos documentos y ejecución." },
            { icon: ClipboardCheck, title: "Rendición pública", text: "Informe por campaña y memoria anual." },
            { icon: MapPin, title: "6 regiones", text: "Puntos de acopio para donar en especie." },
            { icon: BadgeCheck, title: "Certificado inmediato", text: "Descargable desde tu panel." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 90} className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Categorías</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">¿Qué quieres donar hoy?</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Cada categoría reúne campañas activas y una lista concreta de lo que más se necesita.
            </p>
          </div>
          <Button asChild variant="ghost" className="gap-1.5">
            <Link to="/categorias">
              Ver las 8 categorías <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category, i) => (
            <Reveal key={category.id} delay={i * 80}>
              <CategoryCard category={category} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">Campañas</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Necesitan ayuda ahora</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Metas reales, plazos claros y donantes que ya se sumaron.
              </p>
            </div>
            <Button asChild variant="ghost" className="gap-1.5">
              <Link to="/campanas">
                Ver todas <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign, i) => (
              <Reveal key={campaign.id} delay={i * 70}>
                <CampaignCard campaign={campaign} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Cómo funciona</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Tres pasos, cero letra chica</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "1. Elige una campaña",
              text: "Filtra por categoría, urgencia o región. Cada ficha muestra meta, plazo y organización responsable.",
            },
            {
              icon: HandHeart,
              title: "2. Dona dinero o artículos",
              text: "Aporta desde S/ 5, activa un aporte mensual o lleva tus donaciones a un punto de acopio.",
            },
            {
              icon: TrendingUp,
              title: "3. Sigue el impacto",
              text: "Recibes tu certificado y los avances de la campaña hasta el informe final de cierre.",
            },
          ].map((step, i) => (
            <Reveal key={step.title} delay={i * 110}>
              <div className="surface lift h-full p-6">
                <span className="accent-panel grid size-11 place-items-center rounded-xl">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRANSPARENCY BAND */}
      {report && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <Reveal className="ink-panel grain relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12">
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Transparencia {report.year}</p>
                <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                  {report.programs_pct}% de cada sol va directo a los programas
                </h2>
                <p className="mt-4 max-w-xl opacity-80">{report.description}</p>
                <Button asChild variant="secondary" className="mt-7 gap-1.5">
                  <Link to="/transparencia">
                    Ver memorias y auditorías <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <dl className="grid grid-cols-2 gap-4">
                {[
                  { label: "Recaudado", value: money(report.total_raised, true) },
                  { label: "Beneficiarios", value: report.total_beneficiaries.toLocaleString("es-PE") },
                  { label: "A programas", value: `${report.programs_pct}%` },
                  { label: "Administración", value: `${report.admin_pct}%` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-ink-foreground/10 p-5">
                    <dt className="text-xs uppercase tracking-wide opacity-60">{stat.label}</dt>
                    <dd className="mt-1 font-display text-2xl font-bold">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Testimonios</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Lo que dicen quienes participan</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <figure className="surface lift h-full p-6">
                  <Quote className="size-6 text-accent/40" />
                  <blockquote className="mt-3 text-sm leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {t.initials}
                    </span>
                    <span className="text-sm">
                      <span className="block font-medium">{t.name}</span>
                      <span className="text-xs text-muted-foreground">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="surface grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <span className="accent-panel inline-grid size-12 place-items-center rounded-2xl">
              <HeartHandshake className="size-6" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              También puedes donar tu tiempo
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Más de 300 voluntarios arman kits, ordenan almacenes y acompañan entregas. Inscríbete y te contactamos en
              72 horas.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild size="lg">
              <Link to="/voluntariado">Quiero ser voluntario</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/puntos-de-acopio">Ver puntos de acopio</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
