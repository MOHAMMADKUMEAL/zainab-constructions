import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, IndianRupee, Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { PendingPaymentDialog } from "@/components/pending-payment-dialog";
import { PaymentDialog } from "@/components/payment-dialog";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteRow, useExpenses, usePayments, useProjects } from "@/lib/data";
import {
  EXPENSE_CATEGORIES,
  categoryLabel,
  formatDate,
  formatMoney,
  type Expense,
} from "@/lib/domain";
import { PAY_STATUS_LABEL, PAY_STATUS_STYLES, summarise } from "@/lib/pending";
import { downloadPendingPaymentsPdf } from "@/lib/pdf";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pending-payments")({
  head: () => ({
    meta: [
      { title: "Pending Payments — Zainab Constructions" },
      {
        name: "description",
        content: "Track finalized amounts, paid amounts and remaining balances for every vendor and worker.",
      },
      { property: "og:title", content: "Pending Payments — Zainab Constructions" },
      {
        property: "og:description",
        content: "Category-wise payables with paid and remaining balances across construction projects.",
      },
    ],
  }),
  component: PendingPaymentsPage,
});

function PendingPaymentsPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: payments = [] } = usePayments();
  const { data: projects = [] } = useProjects();
  const remove = useDeleteRow("expenses", "Pending payment deleted");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payFor, setPayFor] = useState<Expense | null>(null);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.project_name ?? "—";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses
      .map((e) => summarise(e, payments))
      .filter((r) => {
        if (category !== "all" && r.expense.category !== category) return false;
        if (status !== "all" && r.status !== status) return false;
        if (!q) return true;
        return [
          r.expense.description,
          r.expense.notes ?? "",
          categoryLabel(r.expense.category),
          projectName(r.expense.project_id),
        ].some((v) => (v ?? "").toLowerCase().includes(q));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, payments, projects, query, category, status]);

  const totals = rows.reduce(
    (a, r) => ({
      finalized: a.finalized + r.finalized,
      paid: a.paid + r.paid,
      remaining: a.remaining + r.remaining,
    }),
    { finalized: 0, paid: 0, remaining: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Pending Payments</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} entries · {formatMoney(totals.remaining)} still to pay
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => downloadPendingPaymentsPdf(rows, projectName)}
            disabled={rows.length === 0}
          >
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add pending payment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total finalized" value={formatMoney(totals.finalized)} icon={Receipt} loading={isLoading} />
        <StatCard label="Total paid" value={formatMoney(totals.paid)} icon={IndianRupee} tone="success" loading={isLoading} />
        <StatCard label="Remaining" value={formatMoney(totals.remaining)} icon={IndianRupee} tone="destructive" loading={isLoading} />
      </div>

      <Card className="rounded-2xl shadow-card">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="pending-search" className="text-xs text-muted-foreground">
              Search
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pending-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pending payments…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Filter by category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label="Filter by status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="paid">Fully Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expenses.length ? "No entries match your filters" : "No pending payments yet"}
          description={
            expenses.length
              ? "Adjust search, category or status."
              : "Add a finalized amount payable to a worker or supplier."
          }
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.expense.id} className="rounded-2xl shadow-card">
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {r.expense.description || categoryLabel(r.expense.category)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {projectName(r.expense.project_id)} · {categoryLabel(r.expense.category)} ·{" "}
                      {formatDate(r.expense.expense_date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      PAY_STATUS_STYLES[r.status],
                    )}
                  >
                    {PAY_STATUS_LABEL[r.status]}
                  </span>
                </div>

                {r.expense.plot_length && r.expense.plot_width ? (
                  <p className="text-xs text-muted-foreground">
                    {r.expense.plot_length} ft × {r.expense.plot_width} ft ={" "}
                    {(Number(r.expense.plot_length) * Number(r.expense.plot_width)).toLocaleString("en-IN")} sq ft
                    {r.expense.rate_per_sqft ? ` @ ₹${r.expense.rate_per_sqft}/sq ft` : ""}
                  </p>
                ) : null}

                <dl className="grid grid-cols-3 gap-3 rounded-xl bg-muted/50 p-3 text-center">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Finalized</dt>
                    <dd className="text-sm font-semibold tabular-nums">{formatMoney(r.finalized)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Paid</dt>
                    <dd className="text-sm font-semibold tabular-nums text-success">{formatMoney(r.paid)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Remaining</dt>
                    <dd className="text-sm font-semibold tabular-nums text-destructive">
                      {formatMoney(r.remaining)}
                    </dd>
                  </div>
                </dl>

                {r.expense.notes ? (
                  <p className="text-xs text-muted-foreground">{r.expense.notes}</p>
                ) : null}

                <div className="flex flex-wrap items-center justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPayFor(r.expense);
                      setPayOpen(true);
                    }}
                  >
                    <IndianRupee className="h-4 w-4" /> Add payment
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit pending payment"
                    onClick={() => {
                      setEditing(r.expense);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    title="Delete this pending payment?"
                    description="Linked payment history will lose its reference."
                    onConfirm={() => remove.mutate(r.expense.id)}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Delete pending payment">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PendingPaymentDialog open={open} onOpenChange={setOpen} expense={editing} />
      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        {...(payFor ? { defaultProjectId: payFor.project_id, defaultExpenseId: payFor.id } : {})}
      />
    </div>
  );
}
