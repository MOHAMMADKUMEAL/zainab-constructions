import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Wallet } from "lucide-react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { PaymentDialog } from "@/components/payment-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteRow, usePayments, useProjects } from "@/lib/data";
import { PAYMENT_METHODS, formatDate, formatMoney, methodLabel, sum, type Payment } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Zainab Constructions" },
      { name: "description", content: "Client payments received across all construction projects." },
      { property: "og:title", content: "Payments — Zainab Constructions" },
      { property: "og:description", content: "Track received amounts and remaining balances by project." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { data: payments = [], isLoading } = usePayments();
  const { data: projects = [] } = useProjects();
  const remove = useDeleteRow("payments", "Payment deleted");

  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.project_name ?? "—";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      if (method !== "all" && p.payment_method !== method) return false;
      if (!q) return true;
      return [projectName(p.project_id), p.notes, methodLabel(p.payment_method)].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, projects, query, method]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Payments</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} entries · {formatMoney(sum(filtered))} received
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add payment
        </Button>
      </div>

      <Card className="rounded-2xl shadow-card">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search payments…"
              className="pl-9"
              aria-label="Search payments"
            />
          </div>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger aria-label="Filter by method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={payments.length ? "No payments match your filters" : "No payments yet"}
          description={payments.length ? "Try another search or method." : "Record money received from a client."}
        />
      ) : (
        <Card className="rounded-2xl shadow-card">
          <CardContent className="divide-y divide-border p-0">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{projectName(p.project_id)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {methodLabel(p.payment_method)} · {formatDate(p.payment_date)}
                    {p.notes ? ` · ${p.notes}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm font-semibold text-success">{formatMoney(p.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit payment"
                    onClick={() => {
                      setEditing(p);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    title="Delete this payment?"
                    description="The received total will be recalculated."
                    onConfirm={() => remove.mutate(p.id)}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Delete payment">
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

      <PaymentDialog open={open} onOpenChange={setOpen} payment={editing} />
    </div>
  );
}
