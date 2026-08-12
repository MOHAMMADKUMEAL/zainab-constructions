import { useEffect, useState } from "react";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useExpenses, usePayments, useProjects, useSaveRow } from "@/lib/data";
import {
  PAYMENT_METHODS,
  categoryLabel,
  formatMoney,
  type Payment,
  type PaymentMethod,
} from "@/lib/domain";
import { summarise } from "@/lib/pending";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
  defaultProjectId?: string;
  defaultExpenseId?: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const NONE = "none";

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  defaultProjectId,
  defaultExpenseId,
}: Props) {
  const { data: projects = [] } = useProjects();
  const { data: allExpenses = [] } = useExpenses();
  const { data: allPayments = [] } = usePayments();
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [expenseId, setExpenseId] = useState<string>(defaultExpenseId ?? NONE);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [screenshotPath, setScreenshotPath] = useState("");
  const [uploading, setUploading] = useState(false);

  const save = useSaveRow<Payment>("payments", {
    created: "Payment recorded",
    updated: "Payment updated",
  });

  useEffect(() => {
    if (!open) return;
    setProjectId(payment?.project_id ?? defaultProjectId ?? "");
    setExpenseId(payment?.expense_id ?? defaultExpenseId ?? NONE);
    setMethod(payment?.payment_method ?? "cash");
    setAmount(payment ? String(payment.amount) : "");
    setDate(payment?.payment_date ?? today());
    setNotes(payment?.notes ?? "");
    setScreenshotPath(payment?.screenshot_path ?? "");
  }, [open, payment, defaultProjectId, defaultExpenseId]);

  const projectExpenses = allExpenses.filter((e) => e.project_id === projectId);
  const linked = allExpenses.find((e) => e.id === expenseId) ?? null;
  const linkedSummary = linked
    ? summarise(
        linked,
        allPayments.filter((p) => p.id !== payment?.id),
      )
    : null;
  const overpaying =
    !!linkedSummary && Number(amount || 0) > linkedSummary.remaining + 0.5;


  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("You must be signed in");
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("payment-screenshots").upload(path, file);
      if (error) throw error;
      setScreenshotPath(path);
      toast.success("Screenshot attached");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    save.mutate(
      {
        id: payment?.id,
        values: {
          project_id: projectId,
          amount: Number(amount || 0),
          payment_method: method,
          payment_date: date,
          notes,
          screenshot_path: screenshotPath,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{payment ? "Edit payment" : "Record payment"}</DialogTitle>
          <DialogDescription>Log money received from the client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="payment-project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount (₹)</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger id="payment-method">
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
          <div className="space-y-2">
            <Label htmlFor="payment-date">Payment date</Label>
            <Input
              id="payment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-screenshot">Payment screenshot (optional)</Label>
            {screenshotPath ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{screenshotPath.split("/").pop()}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove screenshot"
                  onClick={() => setScreenshotPath("")}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <Input
                id="payment-screenshot"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
            )}
            {uploading ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes</Label>
            <Textarea
              id="payment-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending || uploading || !projectId}>
              {save.isPending ? "Saving…" : payment ? "Save changes" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
