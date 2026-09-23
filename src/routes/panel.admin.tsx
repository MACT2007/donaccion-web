import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/donaccion";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/panel/admin")({
  head: () => ({
    meta: [
      { title: "Administración | DonAcción" },
      { name: "description", content: "Panel interno de mensajes, voluntarios y donaciones registradas." },
      { property: "og:title", content: "Administración | DonAcción" },
      { property: "og:description", content: "Gestión interna de DonAcción." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const { session, loading, isAdmin, roleLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (!roleLoading && !isAdmin) navigate({ to: "/panel", replace: true });
  }, [loading, roleLoading, session, isAdmin, navigate]);

  const { data, isLoading } = useQuery({
    enabled: !!session && isAdmin,
    queryKey: ["admin-inbox"],
    queryFn: async () => {
      const [messages, volunteers, donations] = await Promise.all([
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(60),
        supabase.from("volunteers").select("*").order("created_at", { ascending: false }).limit(60),
        supabase
          .from("donations")
          .select("*, campaigns(title)")
          .order("created_at", { ascending: false })
          .limit(60),
      ]);
      return {
        messages: messages.data ?? [],
        volunteers: volunteers.data ?? [],
        donations: donations.data ?? [],
      };
    },
  });

  if (loading || roleLoading || !session || !isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Administración</p>
            <h1 className="animate-fade-up mt-3 font-display text-3xl font-bold sm:text-4xl">Bandeja interna</h1>
            <p className="animate-fade-up mt-2 opacity-80 [animation-delay:120ms]">
              Mensajes de contacto, postulaciones de voluntariado y últimas donaciones registradas.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <Link to="/panel/gestion">Gestionar contenido</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/panel">Volver a mi panel</Link>
            </Button>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Mail, label: "Mensajes", value: data?.messages.length ?? 0 },
            { icon: Users, label: "Postulaciones", value: data?.volunteers.length ?? 0 },
            { icon: Inbox, label: "Donaciones recientes", value: data?.donations.length ?? 0 },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="surface p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-accent">
                  <stat.icon className="size-5" />
                </span>
                <p className="mt-4 font-display text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {isLoading ? (
          <Skeleton className="mt-12 h-72 rounded-2xl" />
        ) : (
          <Tabs defaultValue="mensajes" className="mt-12">
            <TabsList>
              <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
              <TabsTrigger value="voluntarios">Voluntarios</TabsTrigger>
              <TabsTrigger value="donaciones">Donaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="mensajes" className="mt-6 space-y-4">
              {(data?.messages ?? []).map((m) => (
                <article key={m.id} className="surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-semibold">{m.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {m.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{m.subject}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString("es-PE")}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{m.message}</p>
                </article>
              ))}
              {(data?.messages ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay mensajes por ahora.</p>
              )}
            </TabsContent>

            <TabsContent value="voluntarios" className="mt-6 space-y-4">
              {(data?.volunteers ?? []).map((v) => (
                <article key={v.id} className="surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-semibold">{v.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {v.email}
                        {v.city ? ` · ${v.city}` : ""}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(v.created_at).toLocaleDateString("es-PE")}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[v.skills, v.availability].filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {v.message && <p className="mt-3 text-sm text-muted-foreground">{v.message}</p>}
                </article>
              ))}
              {(data?.volunteers ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay postulaciones por ahora.</p>
              )}
            </TabsContent>

            <TabsContent value="donaciones" className="mt-6">
              <div className="surface overflow-x-auto">
                <table className="w-full min-w-[44rem] text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Donante</th>
                      <th className="p-4">Campaña</th>
                      <th className="p-4">Detalle</th>
                      <th className="p-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.donations ?? []).map((d) => (
                      <tr key={d.id} className="border-b border-border/60 last:border-0">
                        <td className="p-4 text-muted-foreground">
                          {new Date(d.created_at).toLocaleDateString("es-PE")}
                        </td>
                        <td className="p-4">{d.is_anonymous ? "Anónimo" : (d.donor_name ?? "—")}</td>
                        <td className="p-4">{d.campaigns?.title ?? "Aporte general"}</td>
                        <td className="p-4">
                          {Number(d.amount ?? 0) > 0 ? money(d.amount ?? 0) : (d.goods_description || "Especie")}
                        </td>
                        <td className="p-4 capitalize text-muted-foreground">{d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </section>
    </>
  );
}
