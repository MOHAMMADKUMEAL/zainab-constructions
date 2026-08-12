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
import { useProjects, useSaveRow } from "@/lib/data";
import { EXPENSE_CATEGORIES, formatMoney, type Expense, type ExpenseCategory } from "@/lib/domain";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  defaultProjectId?: string;
  defaultCategory?: ExpenseCategory;
};

const today = () => new Date().toISOString().slice(0, 10);

export function PendingPaymentDialog({
  open,
  onOpenChange,
  expense,
  defaultProjectId,
  defaultCategory,
}: Props) {
  const { data: projects = [] } = useProjects();
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [category, setCategory] = useState<ExpenseCategory>(defaultCategory ?? "material");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [rate, setRate] = useState("");

  const save = useSaveRow<Expense>("expenses", {
    created: "Pending payment added",
    updated: "Pending payment updated",
  });

  useEffect(() => {
    if (!open) return;
    setProjectId(expense?.project_id ?? defaultProjectId ?? "");
    setCategory(expense?.category ?? defaultCategory ?? "material");
    setDescription(expense?.description ?? "");
    setAmount(expense ? String(expense.amount) : "");
    setDate(expense?.expense_date ?? today());
    setNotes(expense?.notes ?? "");
    setLength(expense?.plot_length != null ? String(expense.plot_length) : "");
    setWidth(expense?.plot_width != null ? String(expense.plot_width) : "");
    setRate(expense?.rate_per_sqft != null ? String(expense.rate_per_sqft) : "");
  }, [open, expense, defaultProjectId, defaultCategory]);

  const isGoundi = category === "goundi";
  const area = Number(length || 0) * Number(width || 0);
  const computed = area * Number(rate || 0);
  const finalized = isGoundi && computed > 0 ? computed : Number(amount || 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    save.mutate(
      {
        id: expense?.id,
        values: {
          project_id: projectId,
          category,
          description: description.trim(),
          amount: finalized,
          expense_date: date,
          notes: notes.trim(),
          plot_length: isGoundi && length ? Number(length) : null,
          plot_width: isGoundi && width ? Number(width) : null,
          rate_per_sqft: isGoundi && rate ? Number(rate) : null,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit pending payment" : "Add pending payment"}</DialogTitle>
          <DialogDescription>
            Record an amount payable to a vendor, worker or supplier.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pending-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="pending-project">
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

          <div className="space-y-2">
            <Label htmlFor="pending-category">Category / vendor</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger id="pending-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isGoundi ? (
            <div className="space-y-3 rounded-xl border border-border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Goundi rate calculation
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="plot-length">Length (ft)</Label>
                  <Input
                    id="plot-length"
                    type="number"
                    min="0"
                    step="0.01"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plot-width">Width (ft)</Label>
                  <Input
                    id="plot-width"
                    type="number"
                    min="0"
                    step="0.01"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plot-rate">Rate (₹/sq ft)</Label>
                  <Input
                    id="plot-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {area > 0
                  ? `${length} ft × ${width} ft = ${area.toLocaleString("en-IN")} sq ft`
                  : "Enter length and width to calculate the area."}
                {computed > 0
                  ? ` · ${area.toLocaleString("en-IN")} × ₹${rate} = ${formatMoney(computed)}`
                  : ""}
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pending-amount">Finalized amount (₹)</Label>
              <Input
                id="pending-amount"
                type="number"
                min="0"
                step="1"
                required={!isGoundi || computed <= 0}
                disabled={isGoundi && computed > 0}
                value={isGoundi && computed > 0 ? String(computed) : amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pending-date">Date</Label>
              <Input
                id="pending-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pending-desc">Description</Label>
            <Textarea
              id="pending-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pending-notes">Notes</Label>
            <Textarea
              id="pending-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending || !projectId}>
              {save.isPending ? "Saving…" : expense ? "Save changes" : "Add pending payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
