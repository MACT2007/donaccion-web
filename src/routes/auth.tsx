import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartHandshake, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar o crear cuenta | DonAcción" },
      {
        name: "description",
        content:
          "Ingresa a DonAcción para ver el historial de tus donaciones, descargar certificados y seguir el avance de tus campañas.",
      },
      { property: "og:title", content: "Ingresar a DonAcción" },
      { property: "og:description", content: "Tu panel con historial de donaciones y certificados." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (session) navigate({ to: "/panel", replace: true });
  }, [session, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.email.trim() || form.password.length < 6) {
      toast.error("Ingresa un correo válido y una contraseña de al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.full_name.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(true);
          return;
        }
        toast.success("¡Cuenta creada!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Bienvenido de vuelta");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.includes("Invalid login")
          ? "Correo o contraseña incorrectos."
          : message.includes("already registered")
            ? "Ya existe una cuenta con este correo."
            : "No pudimos completar la operación. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("No pudimos iniciar sesión con Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/panel" });
  }

  async function forgot() {
    if (!form.email.trim()) {
      toast.error("Escribe tu correo para enviarte el enlace.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error("No pudimos enviar el enlace.");
    else toast.success("Te enviamos un enlace para crear una nueva contraseña.");
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
      <div className="hidden lg:block">
        <span className="accent-panel grid size-12 place-items-center rounded-2xl">
          <HeartHandshake className="size-6" />
        </span>
        <h1 className="animate-fade-up mt-6 font-display text-4xl font-bold">
          Tu cuenta DonAcción, tu historial de impacto
        </h1>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li>Historial completo de tus donaciones y certificados descargables.</li>
          <li>Avisos del avance y cierre de las campañas que apoyaste.</li>
          <li>Gestión de tus aportes mensuales y donaciones en especie.</li>
        </ul>
        <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" /> Protegemos tus datos y nunca los compartimos con terceros.
        </p>
      </div>

      <div className="surface p-6 sm:p-8">
        {emailSent ? (
          <div className="py-10 text-center">
            <h2 className="font-display text-xl font-bold">Confirma tu correo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enviamos un enlace de confirmación a {form.email}. Al abrirlo, tu cuenta quedará activa.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setEmailSent(false)}>
              Volver
            </Button>
          </div>
        ) : (
          <>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">
                  Ingresar
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Crear cuenta
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="a-name">Nombre completo</Label>
                  <Input
                    id="a-name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="María Quispe"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="a-email">Correo</Label>
                <Input
                  id="a-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-password">Contraseña</Label>
                <Input
                  id="a-password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {mode === "login" ? "Ingresar" : "Crear mi cuenta"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" size="lg" className="w-full" onClick={google}>
              Continuar con Google
            </Button>

            {mode === "login" && (
              <button
                type="button"
                onClick={forgot}
                className="mt-5 block w-full text-center text-sm text-muted-foreground underline-grow"
              >
                Olvidé mi contraseña
              </button>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Al continuar aceptas nuestras políticas de uso y{" "}
              <Link to="/transparencia" className="underline-grow">
                rendición de cuentas
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </section>
  );
}
