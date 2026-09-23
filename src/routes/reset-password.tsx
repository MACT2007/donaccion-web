import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Crear una nueva contraseña | DonAcción" },
      { name: "description", content: "Define una nueva contraseña para tu cuenta de DonAcción." },
      { property: "og:title", content: "Nueva contraseña | DonAcción" },
      { property: "og:description", content: "Restablece el acceso a tu cuenta de donante." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("El enlace pudo haber expirado. Solicita uno nuevo.");
      return;
    }
    toast.success("Contraseña actualizada");
    navigate({ to: "/panel", replace: true });
  }

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="surface p-8">
        <span className="accent-panel grid size-12 place-items-center rounded-2xl">
          <KeyRound className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">Crea una nueva contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escribe tu nueva contraseña dos veces para confirmarla.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="r-pass">Nueva contraseña</Label>
            <Input
              id="r-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-confirm">Repetir contraseña</Label>
            <Input
              id="r-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Guardar contraseña
          </Button>
        </form>
      </div>
    </section>
  );
}
