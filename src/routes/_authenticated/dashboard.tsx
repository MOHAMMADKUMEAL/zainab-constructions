import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  HardHat,
  IndianRupee,
  Plus,
  Receipt,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { ProjectDialog } from "@/components/project-dialog";
import { PendingPaymentDialog } from "@/components/pending-payment-dialog";
import { PaymentDialog } from "@/components/payment-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenses, usePayments, useProjects } from "@/lib/data";
import { summariseCategory } from "@/lib/pending";
import {
  KHARCHA_CATEGORY,
  WORK_CATEGORIES,
  categoryLabel,
  formatCompactMoney,
  formatDate,
  formatMoney,
  lastMonths,
  methodLabel,
  monthKey,
  monthLabel,
  sum,
} from "@/lib/domain";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Zainab Constructions" },
      { name: "description", content: "Budgets, expenses, payments and balance across all your construction projects." },
      { property: "og:title", content: "Dashboard — Zainab Constructions" },
      { property: "og:description", content: "Live totals for every construction project you run." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const projects = useProjects();
  const expenses = useExpenses();
  const payments = usePayments();
  const [projectOpen, setProjectOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const loading = projects.isLoading || expenses.isLoading || payments.isLoading;
  const projectRows = projects.data ?? [];
  const expenseRows = expenses.data ?? [];
  const paymentRows = payments.data ?? [];

  const totalBudget = projectRows.reduce((a, p) => a + Number(p.budget ?? 0), 0);
  const totalExpenses = sum(expenseRows);
  const totalPayments = sum(paymentRows);
  const active = projectRows.filter((p) => p.status === "running").length;

  const months = useMemo(() => lastMonths(6), []);
  const monthly = useMemo(
    () =>
      months.map((m) => ({
        month: monthLabel(m),
        expenses: sum(expenseRows.filter((e) => monthKey(e.expense_date) === m)),
        payments: sum(paymentRows.filter((p) => monthKey(p.payment_date) === m)),
      })),
    [months, expenseRows, paymentRows],
  );

  const byProject = useMemo(
    () =>
      projectRows
        .map((p) => ({
          name: p.project_name.length > 14 ? p.project_name.slice(0, 13) + "…" : p.project_name,
          value: sum(expenseRows.filter((e) => e.project_id === p.id)),
        }))
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [projectRows, expenseRows],
  );

  const projectName = (id: string) =>
    projectRows.find((p) => p.id === id)?.project_name ?? "Unknown project";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Money in, money out, across every site.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setProjectOpen(true)}>
            <Plus className="h-4 w-4" /> Add project
          </Button>
          <Button variant="outline" onClick={() => setExpenseOpen(true)}>
            <Receipt className="h-4 w-4" /> Add pending payment
          </Button>
          <Button variant="outline" onClick={() => setPaymentOpen(true)}>
            <Wallet className="h-4 w-4" /> Add payment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total projects" value={String(projectRows.length)} icon={Building2} loading={loading} />
        <StatCard label="Active projects" value={String(active)} icon={HardHat} tone="accent" loading={loading} />
        <StatCard label="Total budget" value={formatMoney(totalBudget)} icon={IndianRupee} loading={loading} />
        <StatCard label="Total expenses" value={formatMoney(totalExpenses)} icon={Receipt} tone="destructive" loading={loading} />
        <StatCard label="Payments received" value={formatMoney(totalPayments)} icon={Wallet} tone="success" loading={loading} />
        <StatCard
          label="Remaining balance"
          value={formatMoney(totalBudget - totalPayments)}
          hint="Budget minus payments received"
          icon={Scale}
          loading={loading}
        />
      </div>

      <Card className="rounded-2xl shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Category-wise payments</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/category-payments">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Finalized</p>
                  <p className="text-base font-semibold tabular-nums">{formatMoney(categoryTotals.finalized)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Paid</p>
                  <p className="text-base font-semibold tabular-nums text-success">{formatMoney(categoryTotals.paid)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Remaining</p>
                  <p className="text-base font-semibold tabular-nums text-destructive">{formatMoney(categoryTotals.remaining)}</p>
                </div>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {categorySummaries.map((c) => (
                  <li key={c.category} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <Link
                      to="/category-payments/$category"
                      params={{ category: c.category }}
                      className="font-medium hover:underline"
                    >
                      {categoryLabel(c.category)}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">
                      {formatMoney(c.finalized)} · paid{" "}
                      <span className="text-success">{formatMoney(c.paid)}</span> · left{" "}
                      <span className="text-destructive">{formatMoney(c.remaining)}</span>
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="font-medium">{categoryLabel(KHARCHA_CATEGORY)}</span>
                  <span className="tabular-nums text-muted-foreground">{formatMoney(kharchaTotal)}</span>
                </li>
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-muted-foreground" /> Monthly expenses & payments
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly} margin={{ left: -12, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis
                    tickFormatter={(v: number) => formatCompactMoney(v)}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v)}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Line type="monotone" dataKey="expenses" stroke="var(--chart-5)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="payments" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Project-wise expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : byProject.length === 0 ? (
              <p className="grid h-full place-items-center text-sm text-muted-foreground">
                No expenses recorded yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byProject} margin={{ left: -12, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                  <YAxis
                    tickFormatter={(v: number) => formatCompactMoney(v)}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    formatter={(v: number) => formatMoney(v)}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {byProject.map((_, i) => (
                      <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : expenseRows.length === 0 ? (
              <EmptyState icon={Receipt} title="No expenses yet" description="Add your first site expense." />
            ) : (
              <ul className="divide-y divide-border">
                {expenseRows.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {e.description || categoryLabel(e.category)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {projectName(e.project_id)} · {categoryLabel(e.category)} · {formatDate(e.expense_date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">{formatMoney(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : paymentRows.length === 0 ? (
              <EmptyState icon={Wallet} title="No payments yet" description="Record money received from clients." />
            ) : (
              <ul className="divide-y divide-border">
                {paymentRows.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{projectName(p.project_id)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {methodLabel(p.payment_method)} · {formatDate(p.payment_date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-success">
                      {formatMoney(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {projectRows.length > 0 && (
        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link to="/projects">View all projects</Link>
          </Button>
        </div>
      )}

      <ProjectDialog open={projectOpen} onOpenChange={setProjectOpen} />
      <PendingPaymentDialog open={expenseOpen} onOpenChange={setExpenseOpen} />
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  );
}
