import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignCard } from "@/components/CampaignCard";
import { CategoryIcon } from "@/components/CategoryCard";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { imageFor, toneVar } from "@/lib/donaccion";
import type { CampaignWithCategory, Category } from "@/lib/types";

export const Route = createFileRoute("/categorias/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Donaciones de ${params.slug.replace(/-/g, " ")} | DonAcción` },
      {
        name: "description",
        content:
          "Qué se necesita en esta categoría, campañas activas y cómo entregar tus donaciones en los puntos de acopio.",
      },
      { property: "og:title", content: "Categoría de donación | DonAcción" },
      { property: "og:description", content: "Campañas activas y lista de necesidades de esta categoría." },
    ],
  }),
  component: CategoryDetail,
});

function CategoryDetail() {
  const { slug } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data: category } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      if (!category) return { category: null, campaigns: [] as CampaignWithCategory[] };
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*, categories(name, slug, accent)")
        .eq("category_id", category.id)
        .order("is_urgent", { ascending: false });
      return { category: category as Category, campaigns: (campaigns ?? []) as CampaignWithCategory[] };
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!data?.category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Categoría no encontrada</h1>
        <Button asChild className="mt-6">
          <Link to="/categorias">Ver todas las categorías</Link>
        </Button>
      </div>
    );
  }

  const { category, campaigns } = data;

  return (
    <div style={toneVar(category.accent)}>
      <section className="relative overflow-hidden">
        <img
          src={imageFor(category.slug)}
          alt={category.name}
          width={1600}
          height={700}
          className="h-72 w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-ink/25" />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 text-ink-foreground sm:px-6 lg:px-8">
            <Link to="/categorias" className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100">
              <ArrowLeft className="size-4" /> Todas las categorías
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[var(--tone)]">
                <CategoryIcon icon={category.icon} className="size-6" />
              </span>
              <h1 className="animate-fade-up font-display text-3xl font-bold sm:text-5xl">{category.name}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-8">
        <div className="surface h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Lo que más se necesita</h2>
          <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
          <ul className="mt-5 space-y-2.5">
            {category.needs.map((need) => (
              <li key={need} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--tone)]" />
                {need}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-6 w-full">
            <Link to="/puntos-de-acopio">Dónde entregar mi donación</Link>
          </Button>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold">
            {campaigns.length} {campaigns.length === 1 ? "campaña" : "campañas"} en {category.name.toLowerCase()}
          </h2>
          {campaigns.length === 0 ? (
            <div className="surface mt-6 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Por ahora no hay campañas abiertas aquí. Puedes dejar tu donación en un punto de acopio y la asignamos a
                la siguiente campaña de esta categoría.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {campaigns.map((c, i) => (
                <Reveal key={c.id} delay={i * 80}>
                  <CampaignCard campaign={c} className="h-full" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
