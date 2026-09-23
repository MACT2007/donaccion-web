import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryCard } from "@/components/CategoryCard";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/categorias/")({
  head: () => ({
    meta: [
      { title: "Categorías de donación: ropa, alimentos, salud y más | DonAcción" },
      {
        name: "description",
        content:
          "Ocho categorías de donación con listas concretas de lo que más se necesita: ropa, alimentos, medicinas, educación, juguetes, higiene, hogar y tecnología.",
      },
      { property: "og:title", content: "Categorías de donación | DonAcción" },
      {
        property: "og:description",
        content: "Descubre qué se necesita en cada categoría y encuentra la campaña adecuada para tu aporte.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories-page"],
    queryFn: async () => {
      const [categories, campaigns] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("campaigns").select("category_id, status"),
      ]);
      const counts = new Map<string, number>();
      (campaigns.data ?? []).forEach((c) => {
        if (c.status === "activa" && c.category_id)
          counts.set(c.category_id, (counts.get(c.category_id) ?? 0) + 1);
      });
      return { categories: (categories.data ?? []) as Category[], counts };
    },
  });

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Categorías</p>
          <h1 className="animate-fade-up mt-3 font-display text-4xl font-bold sm:text-5xl">
            Todo lo que se puede donar
          </h1>
          <p className="animate-fade-up mt-4 max-w-2xl opacity-80 [animation-delay:120ms]">
            Cada categoría tiene su propia lista de necesidades reales, definida junto a las organizaciones aliadas.
            Puedes aportar dinero o llevar artículos a un punto de acopio.
          </p>
          <Button asChild variant="secondary" className="mt-7 gap-1.5">
            <Link to="/puntos-de-acopio">
              <PackageCheck className="size-4" /> Ver puntos de acopio
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(data?.categories ?? []).map((category, i) => (
              <Reveal key={category.id} delay={Math.min(i, 8) * 70}>
                <CategoryCard
                  category={category}
                  count={data?.counts.get(category.id) ?? 0}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
