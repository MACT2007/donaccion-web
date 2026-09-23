import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { HeartHandshake, Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/donaccion";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Escribe un correo válido");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setSaving(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("No pudimos guardar tu correo, inténtalo de nuevo");
      return;
    }
    setEmail("");
    toast.success("¡Listo! Te escribiremos con los avances de las campañas.");
  }

  return (
    <footer className="ink-panel grain mt-24">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-ink-foreground/10">
                <HeartHandshake className="size-5" />
              </span>
              <span className="font-display text-lg font-bold">DonAcción</span>
            </div>
            <p className="mt-4 max-w-xs text-sm opacity-75">
              Plataforma de donaciones con trazabilidad: cada aporte tiene campaña, meta y rendición pública.
            </p>
            <p className="mt-6 text-xs opacity-60">Registro de asociación sin fines de lucro N.º 2019-0148372</p>
          </div>

          <nav className="text-sm">
            <p className="font-display text-sm font-semibold">Donar</p>
            <ul className="mt-4 space-y-2.5 opacity-75">
              <li>
                <Link to="/campanas" className="underline-grow">
                  Campañas activas
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="underline-grow">
                  Categorías
                </Link>
              </li>
              <li>
                <Link to="/puntos-de-acopio" className="underline-grow">
                  Puntos de acopio
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="underline-grow">
                  Cómo funciona
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="text-sm">
            <p className="font-display text-sm font-semibold">Organización</p>
            <ul className="mt-4 space-y-2.5 opacity-75">
              <li>
                <Link to="/nosotros" className="underline-grow">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link to="/transparencia" className="underline-grow">
                  Transparencia
                </Link>
              </li>
              <li>
                <Link to="/voluntariado" className="underline-grow">
                  Voluntariado
                </Link>
              </li>
              <li>
                <Link to="/preguntas-frecuentes" className="underline-grow">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="underline-grow">
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="font-display text-sm font-semibold">Boletín solidario</p>
            <p className="mt-4 text-sm opacity-75">Un correo al mes con los avances y las metas cumplidas.</p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                aria-label="Correo para el boletín"
                className="border-ink-foreground/20 bg-ink-foreground/10 text-ink-foreground placeholder:text-ink-foreground/50"
              />
              <Button type="submit" variant="secondary" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Unirme"}
              </Button>
            </form>
            <ul className="mt-6 space-y-2 text-sm opacity-75">
              <li className="flex items-center gap-2">
                <Mail className="size-4" /> {SITE.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" /> {SITE.phone}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4" /> {SITE.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ink-foreground/15 pt-6 text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DonAcción. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link to="/preguntas-frecuentes" className="underline-grow">
              Privacidad
            </Link>
            <Link to="/transparencia" className="underline-grow">
              Rendición de cuentas
            </Link>
            <Link to="/contacto" className="underline-grow">
              Reportar un problema
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
