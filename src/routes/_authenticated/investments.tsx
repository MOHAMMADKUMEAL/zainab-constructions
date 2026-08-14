import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  Landmark,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { InvestmentDialog } from "@/components/investment-dialog";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAgreementPayments,
  useDeleteRow,
  useInvestmentInvestors,
  useInvestments,
  usePropertyAgreements,
} from "@/lib/data";
import { formatDate, formatMoney, methodLabel, type Investment } from "@/lib/domain";
import { downloadAgreementPdf } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/investments")({
  head: () => ({
    meta: [
      { title: "Investments — Zainab Constructions" },
      {
        name: "description",
        content: "Track land and property investments, investor shares and profit on sale.",
      },
      { property: "og:title", content: "Investments — Zainab Constructions" },
      {
        property: "og:description",
        content: "Land and property investments with investor contributions and profit tracking.",
      },
    ],
  }),
  component: InvestmentsPage,
});

function InvestmentsPage() {
  const { data: investments = [], isLoading } = useInvestments();
  const { data: investors = [] } = useInvestmentInvestors();
  const { data: agreements = [] } = usePropertyAgreements();
  const { data: agreementPayments = [] } = useAgreementPayments();
  const remove = useDeleteRow("investments", "Investment deleted");
  const removeAgreement = useDeleteRow("property_agreements", "Agreement deleted");
  const removeAgreementPayment = useDeleteRow("agreement_payments", "Payment deleted");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<PropertyAgreement | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payAgreement, setPayAgreement] = useState<PropertyAgreement | null>(null);
  const [payRemaining, setPayRemaining] = useState(0);


  const totals = useMemo(() => {
    const invested = investments.reduce((a, i) => a + Number(i.purchase_amount ?? 0), 0);
    const sold = investments.reduce((a, i) => a + Number(i.sold_amount ?? 0), 0);
    const realised = investments
      .filter((i) => i.sold_amount != null)
      .reduce((a, i) => a + (Number(i.sold_amount) - Number(i.purchase_amount ?? 0)), 0);
    return { invested, sold, realised };
  }, [investments]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Investments</h1>
          <p className="text-sm text-muted-foreground">
            Land and property bought, with investor shares and profit.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add investment
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total invested" value={formatMoney(totals.invested)} icon={Landmark} />
        <StatCard label="Total sold value" value={formatMoney(totals.sold)} icon={TrendingUp} tone="success" />
        <StatCard
          label="Realised profit"
          value={formatMoney(totals.realised)}
          hint="Sold properties only"
          icon={TrendingUp}
          tone={totals.realised < 0 ? "destructive" : "accent"}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : investments.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No investments yet"
          description="Add a land or property purchase and the people who invested in it."
        />
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => {
            const rows = investors.filter((x) => x.investment_id === inv.id);
            const purchase = Number(inv.purchase_amount ?? 0);
            const sold = inv.sold_amount == null ? null : Number(inv.sold_amount);
            const profit = sold == null ? null : sold - purchase;
            return (
              <Card key={inv.id} className="rounded-2xl shadow-card">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-semibold">{inv.title}</h2>
                        <Badge variant="outline">{sold == null ? "Holding" : "Sold"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {inv.location || "—"} · Bought {formatDate(inv.purchase_date)}
                        {sold != null ? ` · Sold ${formatDate(inv.sold_date)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit investment"
                        onClick={() => {
                          setEditing(inv);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDelete
                        title="Delete this investment?"
                        description="Investor entries for it will also be removed."
                        onConfirm={() => remove.mutate(inv.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Delete investment">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  <dl className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        Purchase amount
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold">{formatMoney(purchase)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        Sold for
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold">
                        {sold == null ? "Not sold yet" : formatMoney(sold)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        Profit / loss
                      </dt>
                      <dd
                        className={
                          "mt-0.5 text-sm font-semibold " +
                          (profit == null ? "" : profit < 0 ? "text-destructive" : "text-success")
                        }
                      >
                        {profit == null ? "—" : formatMoney(profit)}
                      </dd>
                    </div>
                  </dl>

                  <div>
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> Investors
                    </p>
                    {rows.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">No investors added.</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {rows.map((r) => {
                          const share = purchase > 0 ? (Number(r.amount) / purchase) * 100 : 0;
                          const payout = profit == null ? null : (Number(r.amount) / (purchase || 1)) * profit;
                          return (
                            <li key={r.id} className="flex flex-wrap justify-between gap-2 text-sm">
                              <span>
                                {r.investor_name}
                                <span className="text-muted-foreground">
                                  {" "}· {share.toFixed(1)}%
                                </span>
                              </span>
                              <span className="font-medium">
                                {formatMoney(r.amount)}
                                {payout != null ? (
                                  <span
                                    className={payout < 0 ? "text-destructive" : "text-success"}
                                  >
                                    {" "}({formatMoney(payout)} profit)
                                  </span>
                                ) : null}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {(() => {
                    const ag = agreements.find((a) => a.investment_id === inv.id);
                    if (!ag) return null;
                    const payRows = agreementPayments.filter((p) => p.agreement_id === ag.id);
                    const total = Number(ag.total_amount ?? 0);
                    const paid = payRows.reduce((a, p) => a + Number(p.amount ?? 0), 0);
                    const balance = Math.max(total - paid, 0);
                    return (
                      <div className="space-y-3 rounded-xl border border-border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" /> Advance payment agreement ·{" "}
                            {formatDate(ag.agreement_date)}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAgreementPdf(ag, payRows)}
                          >
                            <Download className="h-4 w-4" /> PDF
                          </Button>
                        </div>
                        <dl className="grid gap-2 rounded-lg bg-muted/50 p-3 text-center sm:grid-cols-3">
                          <div>
                            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Total
                            </dt>
                            <dd className="text-sm font-semibold tabular-nums">
                              {formatMoney(total)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Paid
                            </dt>
                            <dd className="text-sm font-semibold tabular-nums text-success">
                              {formatMoney(paid)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Balance
                            </dt>
                            <dd className="text-sm font-semibold tabular-nums text-destructive">
                              {formatMoney(balance)}
                            </dd>
                          </div>
                        </dl>
                        {payRows.length ? (
                          <ul className="divide-y divide-border">
                            {payRows.map((p) => (
                              <li
                                key={p.id}
                                className="flex items-center justify-between gap-3 py-2 text-sm"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {formatDate(p.payment_date)}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {methodLabel(p.payment_method)}
                                    {p.notes ? ` · ${p.notes}` : ""}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <span className="font-semibold">{formatMoney(p.amount)}</span>
                                  <ConfirmDelete
                                    title="Delete this payment?"
                                    description="This advance payment entry will be removed."
                                    onConfirm={() => removeAgreementPayment.mutate(p.id)}
                                    trigger={
                                      <Button variant="ghost" size="icon" aria-label="Delete payment">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    }
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {ag.notes ? (
                          <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                            {ag.notes}
                          </p>
                        ) : null}
                      </div>
                    );
                  })()}

                  {inv.notes ? (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{inv.notes}</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <InvestmentDialog open={open} onOpenChange={setOpen} investment={editing} />


    </div>
  );
}
