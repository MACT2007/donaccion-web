import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, HeartHandshake, Package, Receipt, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/donaccion";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/panel/")({
  head: () => ({
    meta: [
      { title: "Mi panel de donante | DonAcción" },
      { name: "description", content: "Historial de tus donaciones, certificados y aportes recurrentes." },
      { property: "og:title", content: "Mi panel | DonAcción" },
      { property: "og:description", content: "Sigue el impacto de tus donaciones en un solo lugar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DonorPanel,
});

function DonorPanel() {
  const { session, loading, isAdmin } = useSession();
  const navigate = useNavigate();
  const userId = session?.user.id;
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const { data, isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ["my-donations", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("donations")
        .select("*, campaigns(title, slug)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const donations = data ?? [];
  const totalMoney = donations
    .filter((d) => Number(d.amount ?? 0) > 0)
    .reduce((sum, d) => sum + Number(d.amount ?? 0), 0);
  const goodsCount = donations.filter((d) => !Number(d.amount ?? 0)).length;
  const recurring = donations.filter((d) => d.is_recurring).length;

  if (loading || !session) {
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
            <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Mi panel</p>
            <h1 className="animate-fade-up mt-3 font-display text-3xl font-bold sm:text-4xl">
              Hola, {session.user.user_metadata?.["full_name"] ?? session.user.email}
            </h1>
            <p className="animate-fade-up mt-2 opacity-80 [animation-delay:120ms]">
              Aquí está el detalle de todo lo que has aportado.
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button asChild variant="secondary" className="gap-1.5">
                  <Link to="/panel/gestion">
                    <ShieldCheck className="size-4" /> Gestionar contenido
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="gap-1.5">
                  <Link to="/panel/admin">
                    <ShieldCheck className="size-4" /> Bandeja interna
                  </Link>
                </Button>
              </>
            )}

            <Button asChild variant="secondary">
              <Link to="/campanas">Donar de nuevo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: HeartHandshake, label: "Total donado", value: money(totalMoney) },
            { icon: Package, label: "Donaciones en especie", value: `${goodsCount}` },
            { icon: Sparkles, label: "Aportes recurrentes", value: `${recurring}` },
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

        <h2 className="mt-14 font-display text-2xl font-bold">Historial de donaciones</h2>
        {isLoading ? (
          <Skeleton className="mt-6 h-52 rounded-2xl" />
        ) : donations.length === 0 ? (
          <div className="surface mt-6 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Todavía no registras donaciones. Elige una campaña y comienza cuando quieras.
            </p>
            <Button asChild className="mt-6">
              <Link to="/campanas">Ver campañas</Link>
            </Button>
          </div>
        ) : (
          <div className="surface mt-6 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Campaña</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Detalle</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Certificado</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/50">
  <td className="p-4 text-muted-foreground">
    {new Date(d.created_at).toLocaleDateString("es-PE")}
  </td>
  <td className="p-4">
    {d.campaigns ? (
      <Link
        to="/campanas/$slug"
        params={{ slug: d.campaigns.slug }}
        className="font-medium hover:text-accent"
      >
        {d.campaigns.title}
      </Link>
    ) : (
      <span className="text-muted-foreground">Aporte general</span>
    )}
  </td>
  <td className="p-4">{Number(d.amount ?? 0) > 0 ? "Dinero" : "Especie"}</td>
  <td className="p-4">
    {Number(d.amount ?? 0) > 0 ? money(d.amount ?? 0) : (d.goods_description || "—")}
    {d.is_recurring && <Badge variant="secondary" className="ml-2">Mensual</Badge>}
  </td>
  <td className="p-4">
    <Badge
      variant={d.status === "confirmada" ? "default" : "secondary"}
      className="capitalize"
    >
      {d.status}
    </Badge>
  </td>
  <td className="p-4">
  {d.status === "confirmada" && Number(d.amount ?? 0) > 0 ? (
    <button
      type="button"
      onClick={() => {
        setSelectedDonation(d);
        setTimeout(() => window.print(), 100);
      }}
      className="inline-flex items-center gap-1.5 text-muted-foreground underline-grow"
    >
      <Download className="size-3.5" /> Descargar
    </button>
  ) : (
    <span className="text-muted-foreground">—</span>
  )}
</td>

</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Reveal className="surface mt-12 flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center">
          <span className="accent-panel grid size-12 shrink-0 place-items-center rounded-2xl">
            <Receipt className="size-6" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">¿Necesitas un certificado formal?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Emitimos constancias con datos fiscales para personas y empresas. Escríbenos y la preparamos en 72 horas.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/contacto">Solicitar constancia</Link>
          </Button>
              </Reveal>
 
            {/* Certificado Único Global */}
{selectedDonation && (
  <div className="only-print p-10 border-[10px] border-double border-emerald-900 text-center flex-col justify-between bg-emerald-50/20">
    {/* Encabezado */}
    <div className="space-y-2 border-b border-emerald-200 pb-4">
      <h1 className="text-4xl font-extrabold tracking-widest text-emerald-900 uppercase">DONACCIÓN</h1>
      <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Cajamarca, Perú — Transparencia y Solidaridad</p>
    </div>
 
    {/* Cuerpo */}
    <div className="my-6 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">CERTIFICADO DE AGRADECIMIENTO</p>
      <p className="text-sm italic text-gray-600">Otorgado con profunda gratitud a:</p>
      <h2 className="text-3xl font-black text-emerald-800 underline decoration-emerald-500 underline-offset-8">
        {session?.user?.user_metadata?.["full_name"] ?? session?.user?.email}
      </h2>
      <p className="max-w-lg mx-auto text-sm text-gray-700 mt-4 leading-relaxed">
        Por su valioso aporte económico de <strong className="text-emerald-950 font-bold">{money(selectedDonation.amount ?? 0)}</strong> a la campaña{" "}
        <strong className="text-emerald-950 font-bold">"{selectedDonation.campaigns?.title || "Aporte General"}"</strong>, contribuyendo directamente al bienestar y desarrollo comunitario.
      </p>
    </div>
 
    {/* Pie de página y firmas */}
    <div className="flex justify-between items-end text-xs text-gray-600 pt-6 border-t border-emerald-200">
      <div className="text-left space-y-1">
        <p><strong className="text-gray-800">Fecha de emisión:</strong> {new Date(selectedDonation.created_at).toLocaleDateString("es-PE")}</p>
        <p><strong className="text-gray-800">Folio único:</strong> DA-{selectedDonation.id.slice(0, 8).toUpperCase()}</p>
      </div>
 
      {/* Sello de Agua / Emblema */}
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-700 flex items-center justify-center text-[9px] font-bold text-emerald-800 uppercase rotate-[-12deg] opacity-80">
        SELLO OFICIAL
      </div>
 
      {/* Firma */}
      <div className="text-center">
        <div className="w-40 border-b border-gray-400 mb-1 mx-auto"></div>
        <p className="font-bold text-gray-800">Maicol Chávez Torres</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dirección General — DonAcción</p>
      </div>
    </div>
  </div>
)}
 
    </section>
  </>
  );
}
