import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAgreementPayments, useInvestmentInvestors, usePropertyAgreements } from "@/lib/data";
import { PAYMENT_METHODS, formatMoney, type Investment, type PaymentMethod } from "@/lib/domain";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment?: Investment | null;
};

type InvestorRow = { name: string; amount: string };

const empty = {
  title: "",
  location: "",
  purchase_amount: "",
  purchase_date: "",
  sold_amount: "",
  sold_date: "",
  notes: "",
};

const emptyAgreement = {
  total_amount: "",
  agreement_date: new Date().toISOString().slice(0, 10),
  advance_amount: "",
  payment_method: "cash" as PaymentMethod,
  notes: "",
};

export function InvestmentDialog({ open, onOpenChange, investment }: Props) {
  const qc = useQueryClient();
  const { data: allInvestors = [] } = useInvestmentInvestors();
  const { data: allAgreements = [] } = usePropertyAgreements();
  const { data: allAgreementPayments = [] } = useAgreementPayments();
  const [form, setForm] = useState(empty);
  const [investors, setInvestors] = useState<InvestorRow[]>([{ name: "", amount: "" }]);
  const [hasAgreement, setHasAgreement] = useState(false);
  const [agreement, setAgreement] = useState(emptyAgreement);
  const [saving, setSaving] = useState(false);

  const existing = useMemo(
    () => allInvestors.filter((i) => i.investment_id === investment?.id),
    [allInvestors, investment?.id],
  );

  const existingAgreement = useMemo(
    () => (investment ? allAgreements.find((a) => a.investment_id === investment.id) ?? null : null),
    [allAgreements, investment],
  );

  const agreementPaid = useMemo(
    () =>
      existingAgreement
        ? allAgreementPayments
            .filter((p) => p.agreement_id === existingAgreement.id)
            .reduce((a, p) => a + Number(p.amount ?? 0), 0)
        : 0,
    [allAgreementPayments, existingAgreement],
  );


  useEffect(() => {
    if (!open) return;
    setForm(
      investment
        ? {
            title: investment.title,
            location: investment.location ?? "",
            purchase_amount: String(investment.purchase_amount ?? ""),
            purchase_date: investment.purchase_date ?? "",
            sold_amount: investment.sold_amount == null ? "" : String(investment.sold_amount),
            sold_date: investment.sold_date ?? "",
            notes: investment.notes ?? "",
          }
        : empty,
    );
    setInvestors(
      existing.length
        ? existing.map((i) => ({ name: i.investor_name, amount: String(i.amount ?? "") }))
        : [{ name: "", amount: "" }],
    );
    setHasAgreement(Boolean(existingAgreement));
    setAgreement(
      existingAgreement
        ? {
            total_amount: String(existingAgreement.total_amount ?? ""),
            agreement_date: existingAgreement.agreement_date ?? emptyAgreement.agreement_date,
            advance_amount: "",
            payment_method: existingAgreement.payment_method,
            notes: existingAgreement.notes ?? "",
          }
        : emptyAgreement,
    );
  }, [open, investment, existing, existingAgreement]);

  const set = (key: keyof typeof empty, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const investedTotal = investors.reduce((acc, i) => acc + Number(i.amount || 0), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const values = {
        title: form.title.trim(),
        location: form.location.trim(),
        purchase_amount: Number(form.purchase_amount || 0),
        purchase_date: form.purchase_date || null,
        sold_amount: form.sold_amount === "" ? null : Number(form.sold_amount),
        sold_date: form.sold_date || null,
        notes: form.notes,
      };

      let investmentId = investment?.id;
      if (investmentId) {
        const { error } = await supabase.from("investments").update(values).eq("id", investmentId);
        if (error) throw error;
        const { error: delError } = await supabase
          .from("investment_investors")
          .delete()
          .eq("investment_id", investmentId);
        if (delError) throw delError;
      } else {
        const { data, error } = await supabase
          .from("investments")
          .insert(values)
          .select("id")
          .single();
        if (error) throw error;
        investmentId = data.id;
      }

      const rows = investors
        .filter((i) => i.name.trim())
        .map((i) => ({
          investment_id: investmentId!,
          investor_name: i.name.trim(),
          amount: Number(i.amount || 0),
        }));
      if (rows.length) {
        const { error } = await supabase.from("investment_investors").insert(rows);
        if (error) throw error;
      }

      if (hasAgreement) {
        const agreementValues = {
          investment_id: investmentId!,
          property_name: form.title.trim(),
          description: form.location.trim(),
          agreement_date: agreement.agreement_date || new Date().toISOString().slice(0, 10),
          total_amount: Number(agreement.total_amount || 0),
          payment_method: agreement.payment_method,
          notes: agreement.notes.trim(),
        };
        let agreementId = existingAgreement?.id;
        if (agreementId) {
          const { error } = await supabase
            .from("property_agreements")
            .update(agreementValues)
            .eq("id", agreementId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("property_agreements")
            .insert(agreementValues)
            .select("id")
            .single();
          if (error) throw error;
          agreementId = data.id;
        }

        const advance = Number(agreement.advance_amount || 0);
        if (advance > 0) {
          const { error } = await supabase.from("agreement_payments").insert({
            agreement_id: agreementId!,
            amount: advance,
            payment_date: agreement.agreement_date || new Date().toISOString().slice(0, 10),
            payment_method: agreement.payment_method,
            notes: "Advance payment",
          });
          if (error) throw error;
        }
      } else if (existingAgreement) {
        const { error } = await supabase
          .from("property_agreements")
          .delete()
          .eq("id", existingAgreement.id);
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ["investments"] });
      qc.invalidateQueries({ queryKey: ["investment_investors"] });
      qc.invalidateQueries({ queryKey: ["property_agreements"] });
      qc.invalidateQueries({ queryKey: ["agreement_payments"] });
      toast.success(investment ? "Investment updated" : "Investment added");
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{investment ? "Edit investment" : "New investment"}</DialogTitle>
          <DialogDescription>Land or property bought with one or more investors.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inv-title">Title</Label>
            <Input
              id="inv-title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="2 acre plot — Bypass Road"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-location">Location</Label>
              <Input
                id="inv-location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-purchase">Purchase amount (₹)</Label>
              <Input
                id="inv-purchase"
                type="number"
                min="0"
                value={form.purchase_amount}
                onChange={(e) => set("purchase_amount", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-purchase-date">Purchase date</Label>
              <Input
                id="inv-purchase-date"
                type="date"
                value={form.purchase_date}
                onChange={(e) => set("purchase_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-sold">Sold for (₹)</Label>
              <Input
                id="inv-sold"
                type="number"
                min="0"
                placeholder="Leave empty if unsold"
                value={form.sold_amount}
                onChange={(e) => set("sold_amount", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-sold-date">Sold date</Label>
              <Input
                id="inv-sold-date"
                type="date"
                value={form.sold_date}
                onChange={(e) => set("sold_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Investors · {formatMoney(investedTotal)}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInvestors((rows) => [...rows, { name: "", amount: "" }])}
              >
                <Plus className="h-4 w-4" /> Add investor
              </Button>
            </div>
            {investors.map((row, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  aria-label="Investor name"
                  placeholder="Investor name"
                  value={row.name}
                  onChange={(e) =>
                    setInvestors((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)),
                    )
                  }
                />
                <Input
                  aria-label="Investor amount"
                  type="number"
                  min="0"
                  placeholder="Amount"
                  className="w-36"
                  value={row.amount}
                  onChange={(e) =>
                    setInvestors((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, amount: e.target.value } : r)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove investor"
                  onClick={() => setInvestors((rows) => rows.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="inv-agreement"
                checked={hasAgreement}
                onCheckedChange={(v) => setHasAgreement(v === true)}
              />
              <Label htmlFor="inv-agreement" className="cursor-pointer">
                Advance payment agreement
              </Label>
            </div>
            {hasAgreement ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ag-total">Total agreed amount (₹)</Label>
                    <Input
                      id="ag-total"
                      type="number"
                      min="0"
                      value={agreement.total_amount}
                      onChange={(e) => setAgreement({ ...agreement, total_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ag-date">Agreement date</Label>
                    <Input
                      id="ag-date"
                      type="date"
                      value={agreement.agreement_date}
                      onChange={(e) =>
                        setAgreement({ ...agreement, agreement_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ag-advance">
                      {existingAgreement ? "Add advance payment (₹)" : "Advance paid (₹)"}
                    </Label>
                    <Input
                      id="ag-advance"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={agreement.advance_amount}
                      onChange={(e) =>
                        setAgreement({ ...agreement, advance_amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment method</Label>
                    <Select
                      value={agreement.payment_method}
                      onValueChange={(v) =>
                        setAgreement({ ...agreement, payment_method: v as PaymentMethod })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Already paid {formatMoney(agreementPaid)} · Balance{" "}
                  {formatMoney(
                    Math.max(
                      Number(agreement.total_amount || 0) -
                        agreementPaid -
                        Number(agreement.advance_amount || 0),
                      0,
                    ),
                  )}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="ag-notes">Agreement notes</Label>
                  <Textarea
                    id="ag-notes"
                    rows={2}
                    value={agreement.notes}
                    onChange={(e) => setAgreement({ ...agreement, notes: e.target.value })}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-notes">Notes</Label>
            <Textarea
              id="inv-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : investment ? "Save changes" : "Add investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
