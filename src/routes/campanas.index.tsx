import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignCard } from "@/components/CampaignCard";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { progress } from "@/lib/donaccion";
import { cn } from "@/lib/utils";
import type { CampaignWithCategory, Category } from "@/lib/types";

export const Route = createFileRoute("/campanas/")({
  head: () => ({
    meta: [
      { title: "Campañas activas de donación | DonAcción" },
      {
        name: "description",
        content:
          "Explora campañas verificadas de abrigo, alimentos, medicinas, educación y más. Filtra por categoría, urgencia y región, y dona en minutos.",
      },
      { property: "og:title", content: "Campañas activas de donación | DonAcción" },
      {
        property: "og:description",
        content: "Metas públicas, plazos claros y organizaciones responsables en cada campaña.",
      },
    ],
  }),
  component: CampaignsPage,
});

const ORDERS = [
  { value: "urgentes", label: "Más urgentes" },
  { value: "cerca", label: "Cerca de la meta" },
  { value: "lejos", label: "Necesitan más apoyo" },
  { value: "donantes", label: "Más donantes" },
] as const;

function CampaignsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [status, setStatus] = useState("activa");
  const [order, setOrder] = useState<string>("urgentes");

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns-all"],
    queryFn: async () => {
      const [campaigns, categories] = await Promise.all([
        supabase.from("campaigns").select("*, categories(name, slug, accent)").order("created_at"),
        supabase.from("categories").select("*").order("sort_order"),
      ]);
      return {
        campaigns: (campaigns.data ?? []) as CampaignWithCategory[],
        categories: (categories.data ?? []) as Category[],
      };
    },
  });

  const filtered = useMemo(() => {
    let list = data?.campaigns ?? [];
    if (status !== "todas") list = list.filter((c) => c.status === status);
    if (category !== "todas") list = list.filter((c) => c.categories?.slug === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.organization.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (order === "urgentes")
      sorted.sort((a, b) => Number(b.is_urgent) - Number(a.is_urgent) || b.donors_count - a.donors_count);
    if (order === "cerca")
      sorted.sort(
        (a, b) =>
          progress(b.raised_amount, b.goal_amount) - progress(a.raised_amount, a.goal_amount),
      );
    if (order === "lejos")
      sorted.sort(
        (a, b) =>
          progress(a.raised_amount, a.goal_amount) - progress(b.raised_amount, b.goal_amount),
      );
    if (order === "donantes") sorted.sort((a, b) => b.donors_count - a.donors_count);
    return sorted;
  }, [data, query, category, status, order]);

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Campañas</p>
          <h1 className="animate-fade-up mt-3 font-display text-4xl font-bold sm:text-5xl">
            Elige dónde quieres que llegue tu ayuda
          </h1>
          <p className="animate-fade-up mt-4 max-w-2xl opacity-80 [animation-delay:120ms]">
            Todas las campañas pasan por verificación documentaria y publican su rendición de cuentas al cierre.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="surface flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, ciudad u organización"
              className="pl-9"
              aria-label="Buscar campañas"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44" aria-label="Categoría">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {(data?.categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40" aria-label="Estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activa">Activas</SelectItem>
                <SelectItem value="completada">Meta cumplida</SelectItem>
                <SelectItem value="todas">Todas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={order} onValueChange={setOrder}>
              <SelectTrigger className="w-52" aria-label="Ordenar">
                <SlidersHorizontal className="mr-1 size-4" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                {ORDERS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory("todas")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              category === "todas" ? "border-accent bg-accent text-accent-foreground" : "border-border",
            )}
          >
            Todas
          </button>
          {(data?.categories ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent",
                category === c.slug ? "border-accent bg-accent text-accent-foreground" : "border-border",
              )}
            >
              {c.name}
            </button>
          ))}
          <Badge variant="secondary" className="ml-auto">
            {filtered.length} {filtered.length === 1 ? "campaña" : "campañas"}
          </Badge>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface mt-10 p-12 text-center">
            <h2 className="font-display text-xl font-semibold">No encontramos campañas con esos filtros</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Prueba con otra categoría o limpia la búsqueda para ver todas las campañas.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign, i) => (
              <Reveal key={campaign.id} delay={Math.min(i, 6) * 70}>
                <CampaignCard campaign={campaign} className="h-full" />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
