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
  formatMoney,
  type AgreementPayment,
  type PaymentMethod,
  type PropertyAgreement,
} from "@/lib/domain";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement: PropertyAgreement | null;
  remaining: number;
};

const today = () => new Date().toISOString().slice(0, 10);

export function AgreementPaymentDialog({ open, onOpenChange, agreement, remaining }: Props) {
  const save = useSaveRow<AgreementPayment>("agreement_payments", {
    created: "Advance payment recorded",
    updated: "Payment updated",
  });
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setDate(today());
    setMethod(agreement?.payment_method ?? "cash");
    setNotes("");
  }, [open, agreement]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) return;
    save.mutate(
      {
        values: {
          agreement_id: agreement.id,
          amount: Number(amount || 0),
          payment_date: date || today(),
          payment_method: method,
          notes: notes.trim(),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const over = Number(amount || 0) > remaining;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add advance payment</DialogTitle>
          <DialogDescription>
            {agreement ? `${agreement.property_name} · ${formatMoney(remaining)} remaining` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ap-amount">Amount (₹)</Label>
              <Input
                id="ap-amount"
                type="number"
                min="0"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {over ? (
                <p className="text-xs text-destructive">More than the remaining balance.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-date">Date</Label>
              <Input
                id="ap-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
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
            <Label htmlFor="ap-notes">Notes</Label>
            <Textarea id="ap-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Save payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
