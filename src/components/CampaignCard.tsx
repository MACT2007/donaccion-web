import { Link } from "@tanstack/react-router";
import { CalendarClock, MapPin, Users, Flame, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { daysLeft, imageFor, money, progress, toneVar } from "@/lib/donaccion";
import type { CampaignWithCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GoalBar({
  raised,
  goal,
  className,
}: {
  raised: number | string;
  goal: number | string;
  className?: string;
}) {
  const pct = progress(raised, goal);
  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-[var(--tone,var(--accent))] transition-[width] duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-display font-semibold">{money(raised)}</span>
        <span className="text-muted-foreground">
          {pct}% de {money(goal)}
        </span>
      </div>
    </div>
  );
}

export function CampaignCard({
  campaign,
  className,
}: {
  campaign: CampaignWithCategory;
  className?: string;
}) {
  const dias = daysLeft(campaign.ends_at);
  const accent = campaign.categories?.accent;

  return (
    <article
      style={toneVar(accent)}
      className={cn("surface lift group flex flex-col overflow-hidden", className)}
    >
      <Link
        to="/campanas/$slug"
        params={{ slug: campaign.slug }}
        className="relative block aspect-16/10 overflow-hidden"
      >
        <img
          src={imageFor(campaign.image_key)}
          alt={campaign.title}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink/70 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {campaign.categories && (
            <Badge className="border-0 bg-[var(--tone)] text-ink-foreground">{campaign.categories.name}</Badge>
          )}
          {campaign.is_urgent && (
            <Badge variant="destructive" className="gap-1">
              <Flame className="size-3" /> Urgente
            </Badge>
          )}
          {campaign.status === "completada" && <Badge variant="secondary">Meta cumplida</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug font-semibold">
          <Link to="/campanas/$slug" params={{ slug: campaign.slug }} className="hover:text-accent">
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{campaign.summary}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {campaign.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" /> {campaign.donors_count} donantes
          </span>
          {dias !== null && (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3.5" /> {dias} días restantes
            </span>
          )}
          {campaign.accepts_goods && (
            <span className="flex items-center gap-1">
              <Package className="size-3.5" /> Recibe en especie
            </span>
          )}
        </div>

        <GoalBar raised={campaign.raised_amount} goal={campaign.goal_amount} className="mt-5" />

        <Link
          to="/campanas/$slug"
          params={{ slug: campaign.slug }}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[var(--shadow-lift)]"
        >
          Donar a esta campaña
        </Link>
      </div>
    </article>
  );
}
