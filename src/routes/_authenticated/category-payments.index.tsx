import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { useExpenses, usePayments, useProjects } from "@/lib/data";
import { WORK_CATEGORIES, categoryLabel, formatMoney } from "@/lib/domain";
import { PAY_STATUS_LABEL, PAY_STATUS_STYLES, summariseCategory } from "@/lib/pending";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/category-payments/")({
  head: () => ({
    meta: [
      { title: "Category Payments — Zainab Constructions" },
      {
        name: "description",
        content: "Category-wise payment dashboard for goundi, shentring, plumber, electrician, painter and tiles work.",
      },
      { property: "og:title", content: "Category Payments — Zainab Constructions" },
      {
        property: "og:description",
        content: "See finalized, paid and remaining amounts for every work category at a glance.",
      },
    ],
  }),
  component: CategoryPaymentsPage,
});

function CategoryPaymentsPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: payments = [] } = usePayments();
  const { data: projects = [] } = useProjects();
  const [projectId, setProjectId] = useState("all");

  const scoped = useMemo(
    () => (projectId === "all" ? expenses : expenses.filter((e) => e.project_id === projectId)),
    [expenses, projectId],
  );

  const cards = useMemo(
    () => WORK_CATEGORIES.map((c) => summariseCategory(c, scoped, payments)),
    [scoped, payments],
  );

  const totals = cards.reduce(
    (a, c) => ({
      finalized: a.finalized + c.finalized,
      paid: a.paid + c.paid,
      remaining: a.remaining + c.remaining,
    }),
    { finalized: 0, paid: 0, remaining: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Category Payments</h1>
          <p className="text-sm text-muted-foreground">
            Finalized, paid and remaining amounts per work category.
          </p>
        </div>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-56" aria-label="Filter by project">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.project_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total finalized" value={formatMoney(totals.finalized)} icon={LayoutGrid} loading={isLoading} />
        <StatCard label="Total paid" value={formatMoney(totals.paid)} icon={LayoutGrid} tone="success" loading={isLoading} />
        <StatCard label="Remaining" value={formatMoney(totals.remaining)} icon={LayoutGrid} tone="destructive" loading={isLoading} />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.category}
              to="/category-payments/$category"
              params={{ category: c.category }}
              className="block"
            >
              <Card className="h-full rounded-2xl shadow-card transition-colors hover:border-primary/40">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-base font-semibold">{categoryLabel(c.category)}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        PAY_STATUS_STYLES[c.status],
                      )}
                    >
                      {PAY_STATUS_LABEL[c.status]}
                    </span>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Finalized</dt>
                      <dd className="text-sm font-semibold tabular-nums">{formatMoney(c.finalized)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Paid</dt>
                      <dd className="text-sm font-semibold tabular-nums text-success">{formatMoney(c.paid)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Remaining</dt>
                      <dd className="text-sm font-semibold tabular-nums text-destructive">
                        {formatMoney(c.remaining)}
                      </dd>
                    </div>
                  </dl>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {c.entries.length} entries · {c.history.length} payments
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
