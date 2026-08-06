import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { ExpenseDialog } from "@/components/expense-dialog";
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
import { useDeleteRow, useExpenses, useProjects } from "@/lib/data";
import { EXPENSE_CATEGORIES, categoryLabel, formatDate, formatMoney, sum, type Expense } from "@/lib/domain";
import { downloadExpensesPdf } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Zainab Constructions" },
      { name: "description", content: "Search and filter every construction site expense by category and date." },
      { property: "og:title", content: "Expenses — Zainab Constructions" },
      { property: "og:description", content: "All site spending across projects, filterable by category and date." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: projects = [] } = useProjects();
  const remove = useDeleteRow("expenses", "Expense deleted");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.project_name ?? "—";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (from && e.expense_date < from) return false;
      if (to && e.expense_date > to) return false;
      if (!q) return true;
      return [e.description, categoryLabel(e.category), projectName(e.project_id)].some((v) =>
        v.toLowerCase().includes(q),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, projects, query, category, from, to]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} entries · {formatMoney(sum(filtered))}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => downloadExpensesPdf(filtered, projectName)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-card">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search expenses…"
              className="pl-9"
              aria-label="Search expenses"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category">
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
          <div className="space-y-1">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expenses.length ? "No expenses match your filters" : "No expenses yet"}
          description={expenses.length ? "Adjust search, category or dates." : "Add your first site expense."}
        />
      ) : (
        <Card className="rounded-2xl shadow-card">
          <CardContent className="divide-y divide-border p-0">
            {filtered.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.description || categoryLabel(e.category)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {projectName(e.project_id)} · {categoryLabel(e.category)} · {formatDate(e.expense_date)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm font-semibold">{formatMoney(e.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit expense"
                    onClick={() => {
                      setEditing(e);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    title="Delete this expense?"
                    description="This entry will be removed from project totals."
                    onConfirm={() => remove.mutate(e.id)}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Delete expense">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ExpenseDialog open={open} onOpenChange={setOpen} expense={editing} />
    </div>
  );
}
