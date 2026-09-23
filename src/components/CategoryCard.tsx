import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Droplets,
  GraduationCap,
  Gift,
  Heart,
  Laptop,
  Shirt,
  Sofa,
  Stethoscope,
  Utensils,
} from "lucide-react";
import { imageFor, toneVar } from "@/lib/donaccion";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = {
  shirt: Shirt,
  utensils: Utensils,
  stethoscope: Stethoscope,
  "graduation-cap": GraduationCap,
  gift: Gift,
  droplets: Droplets,
  sofa: Sofa,
  laptop: Laptop,
  heart: Heart,
} as const;

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? Heart;
  return <Icon className={className} />;
}

export function CategoryCard({
  category,
  count,
  className,
}: {
  category: Category;
  count?: number;
  className?: string;
}) {
  return (
    <Link
      to="/categorias/$slug"
      params={{ slug: category.slug }}
      style={toneVar(category.accent)}
      className={cn("surface lift group relative flex flex-col overflow-hidden", className)}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={imageFor(category.slug)}
          alt={category.name}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/25 to-transparent" />
        <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-xl bg-[var(--tone)] text-ink-foreground shadow-[var(--shadow-soft)]">
          <CategoryIcon icon={category.icon} className="size-5" />
        </span>
        <div className="absolute inset-x-4 bottom-4 text-ink-foreground">
          <h3 className="font-display text-lg font-semibold">{category.name}</h3>
          {typeof count === "number" && (
            <p className="text-xs opacity-80">
              {count} {count === 1 ? "campaña activa" : "campañas activas"}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground">{category.description}</p>
        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          {category.needs.slice(0, 3).map((need) => (
            <li key={need} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[var(--tone)]" />
              {need}
            </li>
          ))}
        </ul>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
          Ver campañas
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
