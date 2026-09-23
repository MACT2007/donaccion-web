import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import type { Faq } from "@/lib/types";

export const Route = createFileRoute("/preguntas-frecuentes")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes sobre donar | DonAcción" },
      {
        name: "description",
        content:
          "Respuestas sobre montos, medios de pago, donaciones en especie, certificados, campañas verificadas y protección de datos.",
      },
      { property: "og:title", content: "Preguntas frecuentes | DonAcción" },
      { property: "og:description", content: "Todo lo que necesitas saber antes de donar, en un solo lugar." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["faqs-all"],
    queryFn: async () => {
      const { data } = await supabase.from("faqs").select("*").order("sort_order");
      return (data ?? []) as Faq[];
    },
  });

  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = (data ?? []).filter(
      (faq) =>
        !term || faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term),
    );
    const map = new Map<string, Faq[]>();
    filtered.forEach((faq) => {
      const key = faq.topic ?? "General";
      map.set(key, [...(map.get(key) ?? []), faq]);
    });
    return [...map.entries()];
  }, [data, query]);

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Ayuda</p>
          <h1 className="animate-fade-up mt-3 font-display text-4xl font-bold sm:text-5xl">Preguntas frecuentes</h1>
          <div className="animate-fade-up relative mt-7 max-w-xl [animation-delay:120ms]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar una pregunta…"
              className="h-12 bg-background pl-10 text-foreground"
              aria-label="Buscar en preguntas frecuentes"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="surface p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No encontramos resultados para “{query}”. Escríbenos y te respondemos directamente.
            </p>
            <Button asChild className="mt-5">
              <Link to="/contacto">Ir a contacto</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([category, faqs], gi) => (
              <Reveal key={category} delay={gi * 80}>
                <h2 className="font-display text-xl font-bold">{category}</h2>
                <Accordion type="single" collapsible className="mt-3">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="surface mt-14 p-8 text-center">
          <h2 className="font-display text-xl font-bold">¿No resolvimos tu duda?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nuestro equipo responde por correo, teléfono y WhatsApp en horario de oficina.
          </p>
          <Button asChild className="mt-6">
            <Link to="/contacto">Contactar al equipo</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
