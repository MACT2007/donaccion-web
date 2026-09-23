import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Flame,
  MapPin,
  Package,
  Share2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CampaignCard, GoalBar } from "@/components/CampaignCard";
import { DonationForm } from "@/components/DonationForm";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { daysLeft, imageFor, money, progress, toneVar } from "@/lib/donaccion";
import type { CampaignWithCategory } from "@/lib/types";

export const Route = createFileRoute("/campanas/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Campaña ${params.slug.replace(/-/g, " ")} | DonAcción` },
      {
        name: "description",
        content:
          "Conoce la meta, el avance y la organización responsable de esta campaña, y dona dinero o artículos en minutos.",
      },
      { property: "og:title", content: "Campaña de donación | DonAcción" },
      {
        property: "og:description",
        content: "Meta pública, avance en tiempo real y rendición de cuentas al cierre de la campaña.",
      },
    ],
  }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { slug } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaign", slug],
    queryFn: async () => {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("*, categories(name, slug, accent)")
        .eq("slug", slug)
        .maybeSingle();
      if (!campaign) throw notFound();
      const { data: related } = await supabase
        .from("campaigns")
        .select("*, categories(name, slug, accent)")
        .eq("category_id", campaign.category_id ?? "")
        .neq("slug", slug)
        .limit(3);
      return {
        campaign: campaign as CampaignWithCategory,
        related: (related ?? []) as CampaignWithCategory[],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="mt-6 h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">No encontramos esta campaña</h1>
        <p className="mt-2 text-muted-foreground">Puede que haya cerrado. Revisa todas las campañas activas.</p>
        <Button asChild className="mt-6">
          <Link to="/campanas">Ver campañas</Link>
        </Button>
      </div>
    );
  }

  const { campaign, related } = data;
  const dias = daysLeft(campaign.ends_at);
  const pct = progress(campaign.raised_amount, campaign.goal_amount);
  const falta = Math.max(0, Number(campaign.goal_amount) - Number(campaign.raised_amount));

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: campaign.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace copiado");
      }
    } catch {
      /* cancelado por la persona */
    }
  }

  return (
    <div style={toneVar(campaign.categories?.accent)}>
      <section className="relative">
        <div className="relative h-[42vh] min-h-72 w-full overflow-hidden">
          <img
            src={imageFor(campaign.image_key)}
            alt={campaign.title}
            width={1600}
            height={900}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/55 to-ink/20" />
        </div>

        <div className="mx-auto -mt-40 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative text-ink-foreground">
            <Link to="/campanas" className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100">
              <ArrowLeft className="size-4" /> Todas las campañas
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              {campaign.categories && (
                <Badge className="border-0 bg-[var(--tone)] text-ink-foreground">{campaign.categories.name}</Badge>
              )}
              {campaign.is_urgent && (
                <Badge variant="destructive" className="gap-1">
                  <Flame className="size-3" /> Urgente
                </Badge>
              )}
              {campaign.status === "completada" && (
                <Badge className="gap-1 border-0 bg-success text-success-foreground">
                  <CheckCircle2 className="size-3" /> Meta cumplida
                </Badge>
              )}
            </div>
            <h1 className="animate-fade-up mt-4 max-w-3xl font-display text-3xl font-bold sm:text-5xl">
              {campaign.title}
            </h1>
            <p className="animate-fade-up mt-3 max-w-2xl opacity-85 [animation-delay:120ms]">{campaign.summary}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8">
        <div>
          <div className="surface grid grid-cols-2 gap-5 p-6 sm:grid-cols-4">
            {[
              { icon: MapPin, label: "Zona", value: campaign.location },
              { icon: Building2, label: "Organización", value: campaign.organization },
              { icon: Users, label: "Donantes", value: `${campaign.donors_count}` },
              {
                icon: CalendarClock,
                label: "Plazo",
                value: dias === null ? "Abierta" : `${dias} días`,
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                  <item.icon className="size-3.5" /> {item.label}
                </p>
                <p className="mt-1 font-display text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-bold">La historia detrás de esta campaña</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{campaign.description}</p>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-bold">¿En qué se usa tu aporte?</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { pct: "70%", label: "Compra y armado de los kits o insumos" },
                { pct: "20%", label: "Traslado, almacén y entrega en campo" },
                { pct: "10%", label: "Verificación, actas y seguimiento" },
              ].map((row) => (
                <div key={row.pct} className="surface p-5">
                  <p className="font-display text-2xl font-bold text-[var(--tone)]">{row.pct}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{row.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-bold">Preguntas sobre esta campaña</h2>
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="a">
                <AccordionTrigger>¿Cómo se verifica la entrega?</AccordionTrigger>
                <AccordionContent>
                  Cada entrega se documenta con acta firmada por la organización aliada y fotografías. El resumen se
                  publica en la sección de transparencia al cierre de la campaña.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>
                  {campaign.accepts_goods
                    ? "¿Puedo llevar artículos en lugar de dinero?"
                    : "¿Por qué esta campaña no recibe artículos?"}
                </AccordionTrigger>
                <AccordionContent>
                  {campaign.accepts_goods
                    ? "Sí. Registra tu donación en especie en el formulario y llévala al punto de acopio más cercano; te escribiremos para coordinar."
                    : "Por tratarse de compras especializadas (medicamentos o insumos con requisitos técnicos) solo recibimos aportes económicos."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="c">
                <AccordionTrigger>¿Qué pasa si se supera la meta?</AccordionTrigger>
                <AccordionContent>
                  El excedente amplía la cobertura de la misma campaña. Si eso no es posible, se traslada a otra
                  campaña de la misma categoría y se informa a los donantes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Reveal>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-6">
            <GoalBar raised={campaign.raised_amount} goal={campaign.goal_amount} />
            <p className="mt-4 text-sm text-muted-foreground">
              {campaign.status === "completada"
                ? "Esta campaña alcanzó su meta. ¡Gracias a cada donante!"
                : `Faltan ${money(falta)} para completar la meta (${pct}% logrado).`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {campaign.accepts_goods && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                  <Package className="size-3.5" /> Recibe donaciones en especie
                </span>
              )}
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 transition-colors hover:text-accent"
              >
                <Share2 className="size-3.5" /> Compartir campaña
              </button>
            </div>
          </div>

          <DonationForm campaign={campaign} />
        </aside>
      </section>

      {related.length > 0 && (
        <section className="bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold">Campañas relacionadas</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((c, i) => (
                <Reveal key={c.id} delay={i * 80}>
                  <CampaignCard campaign={c} className="h-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
