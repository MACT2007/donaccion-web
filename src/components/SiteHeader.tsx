import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { HeartHandshake, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { SITE } from "@/lib/donaccion";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/campanas", label: "Campañas" },
  { to: "/categorias", label: "Categorías" },
  { to: "/como-funciona", label: "Cómo funciona" },
  { to: "/transparencia", label: "Transparencia" },
  { to: "/voluntariado", label: "Voluntariado" },
  { to: "/nosotros", label: "Nosotros" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials =
    (session?.user?.user_metadata?.["full_name"] as string | undefined)
      ?.split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() ?? session?.user?.email?.slice(0, 2).toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <span className="accent-panel grid size-9 place-items-center rounded-xl transition-transform duration-500 group-hover:rotate-6">
            <HeartHandshake className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Don<span className="text-accent">Acción</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {initials}
                  </span>
                  <span className="hidden sm:inline">Mi cuenta</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {session.user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/panel" className="flex items-center gap-2">
                    <LayoutDashboard className="size-4" /> Mi panel
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/panel/gestion" className="flex items-center gap-2">
                        <ShieldCheck className="size-4" /> Gestionar contenido
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/panel/admin" className="flex items-center gap-2">
                        <ShieldCheck className="size-4" /> Bandeja interna
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Ingresar</Link>
            </Button>
          )}

          <Button asChild size="sm" className="gap-1.5">
            <Link to="/campanas">Donar ahora</Link>
          </Button>

          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-border lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-border bg-background/95 px-4 pb-5 pt-3 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/contacto" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground">
              Contacto
            </Link>
            {!session && (
              <Link to="/auth" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground">
                Ingresar / Crear cuenta
              </Link>
            )}
          </nav>
          <p className="mt-3 px-3 text-xs text-muted-foreground">
            {SITE.name} · {SITE.phone}
          </p>
        </div>
      )}
    </header>
  );
}
