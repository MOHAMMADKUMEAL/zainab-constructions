import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "accent" | "success" | "destructive";
  loading?: boolean;
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-secondary text-secondary-foreground",
  accent: "bg-accent/20 text-accent-foreground dark:text-accent",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/12 text-destructive",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "default", loading }: Props) {
  return (
    <Card className="rounded-2xl border-border/70 shadow-card">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1 truncate font-display text-2xl font-semibold">{value}</p>
          )}
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
