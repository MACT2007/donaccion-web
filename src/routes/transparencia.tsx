import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { money, progress } from "@/lib/donaccion";
import type { CampaignWithCategory, TransparencyReport } from "@/lib/types";

export const Route = createFileRoute("/transparencia")({
  head: () => ({
    meta: [
      { title: "Transparencia y rendición de cuentas | DonAcción" },
      {
        name: "description",
        content:
          "Memorias anuales auditadas, distribución del gasto y estado de cada campaña. Así rendimos cuentas de cada sol donado.",
      },
      { property: "og:title", content: "Transparencia y rendición de cuentas | DonAcción" },
      {
        property: "og:description",
        content: "Memorias auditadas, porcentaje destinado a programas y avance público de cada campaña.",
      },
    ],
  }),
  component: TransparencyPage,
});

function TransparencyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["transparency"],
    queryFn: async () => {
      const [reports, campaigns] = await Promise.all([
        supabase.from("transparency_reports").select("*").order("year", { ascending: false }),
        supabase.from("campaigns").select("*, categories(name, slug, accent)").order("created_at"),
      ]);
      return {
        reports: (reports.data ?? []) as TransparencyReport[],
        campaigns: (campaigns.data ?? []) as CampaignWithCategory[],
      };
    },
  });

  const reports = data?.reports ?? [];
  const campaigns = data?.campaigns ?? [];

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Transparencia</p>
          <h1 className="animate-fade-up mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Cada sol donado tiene un destino verificable
          </h1>
          <p className="animate-fade-up mt-4 max-w-2xl opacity-80 [animation-delay:120ms]">
            Publicamos memorias anuales auditadas, la distribución del gasto y el estado de todas las campañas, activas
            y cerradas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Auditoría externa", text: "Estados financieros revisados por un tercero independiente desde 2024." },
            { icon: Scale, title: "Regla 85/10/5", text: "Al menos 85% a programas, hasta 10% a administración y 5% a captación." },
            { icon: FileCheck2, title: "Cierre documentado", text: "Actas de entrega, facturas y padrón de beneficiarios por campaña." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <div className="surface h-full p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-accent">
                  <item.icon className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold">Memorias anuales</h2>
        {isLoading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {reports.map((report, i) => (
              <Reveal key={report.id} delay={i * 90}>
                <article className="surface lift h-full p-6">
                  <p className="font-display text-4xl font-bold text-accent">{report.year}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold">{report.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{report.description}</p>
                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Recaudado</dt>
                      <dd className="font-medium">{money(report.total_raised)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Beneficiarios</dt>
                      <dd className="font-medium">{report.total_beneficiaries.toLocaleString("es-PE")}</dd>
                    </div>
                  </dl>
                  <div className="mt-5 space-y-2">
                    {[
                      { label: "Programas", value: report.programs_pct },
                      { label: "Administración", value: report.admin_pct },
                      { label: "Captación", value: report.fundraising_pct },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{row.label}</span>
                          <span>{row.value}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${row.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <h2 className="mt-16 font-display text-2xl font-bold">Estado de todas las campañas</h2>
        <div className="surface mt-6 overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-4">Campaña</th>
                <th className="p-4">Zona</th>
                <th className="p-4">Meta</th>
                <th className="p-4">Recaudado</th>
                <th className="p-4">Avance</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/50">
                  <td className="p-4">
                    <Link to="/campanas/$slug" params={{ slug: c.slug }} className="font-medium hover:text-accent">
                      {c.title}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">{c.location}</td>
                  <td className="p-4">{money(c.goal_amount)}</td>
                  <td className="p-4">{money(c.raised_amount)}</td>
                  <td className="p-4">{progress(c.raised_amount, c.goal_amount)}%</td>
                  <td className="p-4 capitalize text-muted-foreground">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Reveal className="surface mt-12 flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">¿Encontraste algo que no cuadra?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tenemos un canal de integridad. Escríbenos y respondemos en un máximo de 5 días hábiles.
            </p>
          </div>
          <Button asChild>
            <Link to="/contacto">Escribir al canal de integridad</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
