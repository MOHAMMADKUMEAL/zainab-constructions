import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, IndianRupee } from "lucide-react";
import { PaymentDialog } from "@/components/payment-dialog";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses, usePayments, useProjects } from "@/lib/data";
import {
  categoryLabel,
  formatDate,
  formatMoney,
  methodLabel,
  type ExpenseCategory,
} from "@/lib/domain";
import { PAY_STATUS_LABEL, PAY_STATUS_STYLES, summariseCategory } from "@/lib/pending";
import { downloadCategoryPdf } from "@/lib/pdf";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/category-payments/$category")({
  head: () => ({
    meta: [
      { title: "Category Detail — Zainab Constructions" },
      { name: "description", content: "Work entries, finalized amounts and payment history for one work category." },
      { property: "og:title", content: "Category Detail — Zainab Constructions" },
      { property: "og:description", content: "Detailed payment tracking for a single construction work category." },
    ],
  }),
  component: CategoryDetailPage,
});

function CategoryDetailPage() {
  const { category } = Route.useParams();
  const { data: expenses = [] } = useExpenses();
  const { data: payments = [] } = usePayments();
  const { data: projects = [] } = useProjects();
  const [payOpen, setPayOpen] = useState(false);
  const [payExpenseId, setPayExpenseId] = useState<string | null>(null);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.project_name ?? "—";
  const summary = useMemo(
    () => summariseCategory(category as ExpenseCategory, expenses, payments),
    [category, expenses, payments],
  );
  const payProjectId = expenses.find((e) => e.id === payExpenseId)?.project_id;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            to="/category-payments"
            className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Category Payments
          </Link>
          <h1 className="font-display text-2xl font-semibold">
            {categoryLabel(category as ExpenseCategory)}
          </h1>
        </div>
        <Button variant="outline" onClick={() => downloadCategoryPdf(summary, projectName)}>
          <Download className="h-4 w-4" /> PDF
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Finalized" value={formatMoney(summary.finalized)} icon={IndianRupee} />
        <StatCard label="Paid" value={formatMoney(summary.paid)} icon={IndianRupee} tone="success" />
        <StatCard label="Remaining" value={formatMoney(summary.remaining)} icon={IndianRupee} tone="destructive" />
      </div>

      <Card className="rounded-2xl shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Work entries</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {summary.entries.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No entries in this category yet.</p>
          ) : (
            summary.entries.map((r) => (
              <div key={r.expense.id} className="space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {r.expense.description || projectName(r.expense.project_id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {projectName(r.expense.project_id)} · {formatDate(r.expense.expense_date)}
                      {r.expense.plot_length && r.expense.plot_width
                        ? ` · ${r.expense.plot_length} × ${r.expense.plot_width} ft @ ₹${r.expense.rate_per_sqft ?? 0}/sq ft`
                        : ""}
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
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Finalized {formatMoney(r.finalized)} · Paid {formatMoney(r.paid)} · Remaining{" "}
                    {formatMoney(r.remaining)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPayExpenseId(r.expense.id);
                      setPayOpen(true);
                    }}
                  >
                    Add payment
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payment history</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {summary.history.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No payments made yet.</p>
          ) : (
            summary.history.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{projectName(p.project_id)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {methodLabel(p.payment_method)} · {formatDate(p.payment_date)}
                    {p.notes ? ` · ${p.notes}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatMoney(p.amount)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        {...(payExpenseId && payProjectId
          ? { defaultExpenseId: payExpenseId, defaultProjectId: payProjectId }
          : {})}
      />
    </div>
  );
}
