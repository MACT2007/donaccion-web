import ropa from "@/assets/cat-ropa.jpg";
import alimentos from "@/assets/cat-alimentos.jpg";
import medicinas from "@/assets/cat-medicinas.jpg";
import educacion from "@/assets/cat-educacion.jpg";
import juguetes from "@/assets/cat-juguetes.jpg";
import higiene from "@/assets/cat-higiene.jpg";
import hogar from "@/assets/cat-hogar.jpg";
import tecnologia from "@/assets/cat-tecnologia.jpg";
import general from "@/assets/hero-donaccion.jpg";

export const IMAGES: Record<string, string> = {
  ropa,
  alimentos,
  medicinas,
  educacion,
  juguetes,
  higiene,
  hogar,
  tecnologia,
  general,
};

export function imageFor(key: string | null | undefined) {
  return (key && IMAGES[key]) || general;
}

export function money(value: number | string, compact = false) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(n) ? n : 0);
}

export function progress(raised: number | string, goal: number | string) {
  const r = Number(raised);
  const g = Number(goal);
  if (!g) return 0;
  return Math.min(100, Math.round((r / g) * 100));
}

export function daysLeft(endsAt: string | null) {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function toneVar(accent: string | null | undefined) {
  return { "--tone": `var(--tone-${accent || "default"})` } as React.CSSProperties;
}

export const SITE = {
  name: "DonAcción",
  tagline: "Donar con nombre, apellido y rendición de cuentas",
  email: "donaccion.oficial@gmail.com",
  phone: "+51 947 538 562",
  address: "Jr. Belén 740, Cajamarca, Cajamarca",
  whatsapp: "51947538562",
};
