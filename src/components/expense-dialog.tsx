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
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/lib/domain";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  defaultProjectId?: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export function ExpenseDialog({ open, onOpenChange, expense, defaultProjectId }: Props) {
  const { data: projects = [] } = useProjects();
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [category, setCategory] = useState<ExpenseCategory>("material");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());

  const save = useSaveRow<Expense>("expenses", {
    created: "Expense added",
    updated: "Expense updated",
  });

  useEffect(() => {
    if (!open) return;
    setProjectId(expense?.project_id ?? defaultProjectId ?? "");
    setCategory(expense?.category ?? "material");
    setDescription(expense?.description ?? "");
    setAmount(expense ? String(expense.amount) : "");
    setDate(expense?.expense_date ?? today());
  }, [open, expense, defaultProjectId]);

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
          amount: Number(amount || 0),
          expense_date: date,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>Record site spending against a project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="expense-project">
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
              <Label htmlFor="expense-category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger id="expense-category">
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
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount (₹)</Label>
              <Input
                id="expense-amount"
                type="number"
                min="0"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-date">Expense date</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-desc">Description</Label>
            <Textarea
              id="expense-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending || !projectId}>
              {save.isPending ? "Saving…" : expense ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
