import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Receipt,
  StickyNote,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { ExpenseDialog } from "@/components/expense-dialog";
import { PaymentDialog } from "@/components/payment-dialog";
import { ProjectDialog } from "@/components/project-dialog";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteRow,
  useExpenses,
  usePayments,
  useProject,
  useProjectNotes,
  useSaveRow,
} from "@/lib/data";
import {
  categoryLabel,
  formatDate,
  formatMoney,
  methodLabel,
  statusLabel,
  statusStyles,
  sum,
  type Expense,
  type Payment,
  type ProjectNote,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project details — Zainab Constructions" },
      { name: "description", content: "Budget, expenses, payments and notes for a single construction project." },
      { property: "og:title", content: "Project details — Zainab Constructions" },
      { property: "og:description", content: "Full financial picture for one construction project." },
    ],
  }),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const { data: project, isLoading } = useProject(id);
  const { data: expenses = [] } = useExpenses(id);
  const { data: payments = [] } = usePayments(id);
  const { data: notes = [] } = useProjectNotes(id);

  const [editOpen, setEditOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [noteText, setNoteText] = useState("");

  const removeExpense = useDeleteRow("expenses", "Expense deleted");
  const removePayment = useDeleteRow("payments", "Payment deleted");
  const removeNote = useDeleteRow("project_notes", "Note deleted");
  const saveNote = useSaveRow<ProjectNote>("project_notes", {
    created: "Note added",
    updated: "Note updated",
  });

  if (isLoading) return <Skeleton className="mx-auto h-96 max-w-5xl rounded-2xl" />;

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl">
        <EmptyState
          icon={Receipt}
          title="Project not found"
          description="It may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link to="/projects">Back to projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const spent = sum(expenses);
  const received = sum(payments);
  const budget = Number(project.budget ?? 0);

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Write something first");
      return;
    }
    saveNote.mutate(
      { values: { project_id: id, content: noteText.trim() } },
      { onSuccess: () => setNoteText("") },
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/projects">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold">{project.project_name}</h1>
            <Badge variant="outline" className={cn(statusStyles[project.status])}>
              {statusLabel(project.status)}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {project.client_name || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {project.phone || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {project.location || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(project.start_date)}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Budget" value={formatMoney(budget)} icon={Wallet} />
        <StatCard label="Total expenses" value={formatMoney(spent)} icon={Receipt} tone="destructive" />
        <StatCard label="Payments received" value={formatMoney(received)} icon={Wallet} tone="success" />
        <StatCard
          label="Remaining balance"
          value={formatMoney(budget - received)}
          hint="Budget minus received"
          icon={Wallet}
          tone="accent"
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="rounded-2xl shadow-card">
            <CardContent className="space-y-4 p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Row label="Client" value={project.client_name || "—"} />
                <Row label="Phone" value={project.phone || "—"} />
                <Row label="Location" value={project.location || "—"} />
                <Row label="Start date" value={formatDate(project.start_date)} />
                <Row label="Status" value={statusLabel(project.status)} />
                <Row label="Profit vs spend" value={formatMoney(received - spent)} />
              </dl>
              {project.notes ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Project notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{project.notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingExpense(null);
                setExpenseOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add expense
            </Button>
          </div>
          {expenses.length === 0 ? (
            <EmptyState icon={Receipt} title="No expenses yet" description="Log material, labour and other site costs." />
          ) : (
            <Card className="rounded-2xl shadow-card">
              <CardContent className="divide-y divide-border p-0">
                {expenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.description || categoryLabel(e.category)}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryLabel(e.category)} · {formatDate(e.expense_date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-sm font-semibold">{formatMoney(e.amount)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit expense"
                        onClick={() => {
                          setEditingExpense(e);
                          setExpenseOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDelete
                        title="Delete this expense?"
                        description="This entry will be removed from the project total."
                        onConfirm={() => removeExpense.mutate(e.id)}
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
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingPayment(null);
                setPaymentOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add payment
            </Button>
          </div>
          {payments.length === 0 ? (
            <EmptyState icon={Wallet} title="No payments yet" description="Record what the client has paid." />
          ) : (
            <Card className="rounded-2xl shadow-card">
              <CardContent className="divide-y divide-border p-0">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{methodLabel(p.payment_method)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(p.payment_date)}
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
                          setEditingPayment(p);
                          setPaymentOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDelete
                        title="Delete this payment?"
                        description="The received total will be recalculated."
                        onConfirm={() => removePayment.mutate(p.id)}
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
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          <Card className="rounded-2xl shadow-card">
            <CardContent className="p-5">
              <form onSubmit={addNote} className="space-y-3">
                <Textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Site update, material pending, client instruction…"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={saveNote.isPending}>
                    <Plus className="h-4 w-4" /> Add note
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {notes.length === 0 ? (
            <EmptyState icon={StickyNote} title="No notes yet" description="Notes appear newest first." />
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <Card key={n.id} className="rounded-2xl shadow-card">
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="whitespace-pre-wrap text-sm">{n.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>
                    </div>
                    <ConfirmDelete
                      title="Delete this note?"
                      description="The note will be permanently removed."
                      onConfirm={() => removeNote.mutate(n.id)}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Delete note">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        expense={editingExpense}
        defaultProjectId={id}
      />
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        payment={editingPayment}
        defaultProjectId={id}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
