import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, HandCoins, Loader2, Package, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { money } from "@/lib/donaccion";
import type { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRESETS = [30, 50, 100, 250, 500];

export function DonationForm({ campaign, className }: { campaign: Campaign; className?: string }) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<"dinero" | "especie">("dinero");
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [goods, setGoods] = useState("");
  const [name, setName] = useState((session?.user?.user_metadata?.["full_name"] as string) ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes("@")) {
      toast.error("Necesitamos tu nombre y un correo válido");
      return;
    }
    if (kind === "dinero" && (!finalAmount || finalAmount < 5)) {
      toast.error("El aporte mínimo es de S/ 5");
      return;
    }
    if (kind === "especie" && goods.trim().length < 5) {
      toast.error("Cuéntanos qué artículos vas a donar");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("donations").insert({
      campaign_id: campaign.id,
      user_id: session?.user?.id ?? null,
      donor_name: name.trim(),
      donor_email: email.trim(),
      kind,
      amount: kind === "dinero" ? finalAmount : 0,
      goods_description: kind === "especie" ? goods.trim() : "",
      message: message.trim(),
      is_anonymous: anonymous,
      is_recurring: kind === "dinero" && recurring,
      status: "confirmada",
    });
    setSaving(false);

    if (error) {
      toast.error("No pudimos registrar tu donación. Vuelve a intentarlo.");
      return;
    }
    await queryClient.invalidateQueries();
    setDone(true);
    toast.success("¡Gracias! Tu donación quedó registrada.");
  }

  if (done) {
    return (
      <div className={cn("surface animate-scale-in p-8 text-center", className)}>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/12 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold">¡Gracias, {name.split(" ")[0]}!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {kind === "dinero"
            ? `Registramos tu aporte de ${money(finalAmount)} para “${campaign.title}”.`
            : `Registramos tu donación en especie para “${campaign.title}”. Llévala a cualquier punto de acopio.`}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="secondary">
            <Link to="/puntos-de-acopio">Ver puntos de acopio</Link>
          </Button>
          <Button asChild>
            <Link to={session ? "/panel" : "/campanas"}>
              {session ? "Ver mis donaciones" : "Explorar más campañas"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("surface p-6", className)}>
      <h3 className="font-display text-lg font-semibold">Quiero ayudar</h3>
      <p className="mt-1 text-sm text-muted-foreground">Elige cómo quieres aportar a esta campaña.</p>

      <Tabs value={kind} onValueChange={(v) => setKind(v as "dinero" | "especie")} className="mt-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dinero" className="gap-1.5">
            <HandCoins className="size-4" /> Dinero
          </TabsTrigger>
          <TabsTrigger value="especie" disabled={!campaign.accepts_goods} className="gap-1.5">
            <Package className="size-4" /> En especie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dinero" className="mt-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmount(p);
                  setCustom("");
                }}
                className={cn(
                  "rounded-lg border px-2 py-2.5 text-sm font-medium transition-all",
                  !custom && amount === p
                    ? "border-accent bg-accent text-accent-foreground shadow-[var(--shadow-soft)]"
                    : "border-border hover:border-accent hover:text-accent",
                )}
              >
                S/ {p}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="custom">Otro monto (S/)</Label>
            <Input
              id="custom"
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Ej. 80"
              className="mt-1.5"
            />
          </div>
          <label className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm">
              Convertir en aporte mensual
              <span className="block text-xs text-muted-foreground">Puedes pausarlo cuando quieras.</span>
            </span>
            <Switch checked={recurring} onCheckedChange={setRecurring} />
          </label>
        </TabsContent>

        <TabsContent value="especie" className="mt-5 space-y-4">
          <div>
            <Label htmlFor="goods">¿Qué vas a donar?</Label>
            <Textarea
              id="goods"
              value={goods}
              onChange={(e) => setGoods(e.target.value)}
              placeholder="Ej. 3 frazadas nuevas, 5 chompas de niño talla 8"
              className="mt-1.5 min-h-24"
            />
          </div>
          <p className="rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">
            Coordinaremos por correo la entrega en el punto de acopio más cercano. Los artículos deben estar limpios y
            completos.
          </p>
        </TabsContent>
      </Tabs>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="message">Mensaje para la comunidad (opcional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 min-h-20"
          placeholder="Un mensaje de aliento..."
        />
      </div>

      <label className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
        <span className="text-sm">
          Donar de forma anónima
          <span className="block text-xs text-muted-foreground">Tu nombre no aparecerá en la lista pública.</span>
        </span>
        <Switch checked={anonymous} onCheckedChange={setAnonymous} />
      </label>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={saving}>
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : kind === "dinero" ? (
          `Donar ${money(finalAmount || 0)}`
        ) : (
          "Registrar donación en especie"
        )}
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" /> Datos protegidos · Recibirás tu certificado por correo
      </p>
    </form>
  );
}
