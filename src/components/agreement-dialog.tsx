import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSaveRow } from "@/lib/data";
import {
  PAYMENT_METHODS,
  type Investment,
  type PaymentMethod,
  type PropertyAgreement,
} from "@/lib/domain";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement?: PropertyAgreement | null;
  investments: Investment[];
};

const today = () => new Date().toISOString().slice(0, 10);

const empty = {
  property_name: "",
  description: "",
  agreement_date: today(),
  total_amount: "",
  payment_method: "cash" as PaymentMethod,
  investment_id: "none",
  notes: "",
};

export function AgreementDialog({ open, onOpenChange, agreement, investments }: Props) {
  const save = useSaveRow<PropertyAgreement>("property_agreements", {
    created: "Agreement added",
    updated: "Agreement updated",
  });
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!open) return;
    setForm(
      agreement
        ? {
            property_name: agreement.property_name,
            description: agreement.description ?? "",
            agreement_date: agreement.agreement_date ?? today(),
            total_amount: String(agreement.total_amount ?? ""),
            payment_method: agreement.payment_method,
            investment_id: agreement.investment_id ?? "none",
            notes: agreement.notes ?? "",
          }
        : empty,
    );
  }, [open, agreement]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(
      {
        ...(agreement?.id ? { id: agreement.id } : {}),
        values: {
          property_name: form.property_name.trim(),
          description: form.description.trim(),
          agreement_date: form.agreement_date || today(),
          total_amount: Number(form.total_amount || 0),
          payment_method: form.payment_method,
          investment_id: form.investment_id === "none" ? null : form.investment_id,
          notes: form.notes.trim(),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{agreement ? "Edit agreement" : "New property agreement"}</DialogTitle>
          <DialogDescription>
            Record an advance payment agreement for a land or property deal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ag-name">Property name</Label>
            <Input
              id="ag-name"
              required
              value={form.property_name}
              onChange={(e) => setForm({ ...form, property_name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ag-total">Total agreed amount (₹)</Label>
              <Input
                id="ag-total"
                type="number"
                min="0"
                step="1"
                required
                value={form.total_amount}
                onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ag-date">Agreement date</Label>
              <Input
                id="ag-date"
                type="date"
                value={form.agreement_date}
                onChange={(e) => setForm({ ...form, agreement_date: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Default payment method</Label>
              <Select
                value={form.payment_method}
                onValueChange={(v) => setForm({ ...form, payment_method: v as PaymentMethod })}
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
            <div className="space-y-2">
              <Label>Linked investment</Label>
              <Select
                value={form.investment_id}
                onValueChange={(v) => setForm({ ...form, investment_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {investments.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ag-desc">Description</Label>
            <Input
              id="ag-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ag-notes">Notes</Label>
            <Textarea
              id="ag-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {agreement ? "Save changes" : "Add agreement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
