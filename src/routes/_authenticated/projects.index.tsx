import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, MapPin, Pencil, Phone, Plus, Search, Trash2, User } from "lucide-react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { ProjectDialog } from "@/components/project-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteRow, useExpenses, usePayments, useProjects } from "@/lib/data";
import { formatMoney, statusLabel, statusStyles, sum, type Project } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Zainab Constructions" },
      { name: "description", content: "All construction projects with budget, expenses and payments received." },
      { property: "og:title", content: "Projects — Zainab Constructions" },
      { property: "og:description", content: "Manage every construction project in one list." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: expenses = [] } = useExpenses();
  const { data: payments = [] } = usePayments();
  const remove = useDeleteRow("projects", "Project deleted");

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.project_name, p.client_name, p.location, p.phone].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [projects, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} project(s) tracked</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add project
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects or clients…"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={projects.length ? "No matching projects" : "No projects yet"}
          description={
            projects.length
              ? "Try a different name, client or location."
              : "Create your first project to start tracking budget and site spending."
          }
          action={
            projects.length ? null : (
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add project
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const spent = sum(expenses.filter((e) => e.project_id === p.id));
            const received = sum(payments.filter((x) => x.project_id === p.id));
            return (
              <Card key={p.id} className="group rounded-2xl border-border/70 shadow-card">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/projects/$id" params={{ id: p.id }} className="min-w-0">
                      <h2 className="truncate font-display text-base font-semibold hover:underline">
                        {p.project_name}
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {p.client_name || "—"}
                      </p>
                    </Link>
                    <Badge variant="outline" className={cn("shrink-0", statusStyles[p.status])}>
                      {statusLabel(p.status)}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {p.phone || "—"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> {p.location || "—"}
                    </p>
                  </div>

                  <dl className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/60 p-3 text-center">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Budget</dt>
                      <dd className="text-sm font-semibold">{formatMoney(p.budget)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Expenses</dt>
                      <dd className="text-sm font-semibold text-destructive">{formatMoney(spent)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Received</dt>
                      <dd className="text-sm font-semibold text-success">{formatMoney(received)}</dd>
                    </div>
                  </dl>

                  <div className="flex items-center justify-between gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/projects/$id" params={{ id: p.id }}>
                        Open
                      </Link>
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit project"
                        onClick={() => {
                          setEditing(p);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDelete
                        title="Delete this project?"
                        description="All expenses, payments and notes for this project will be permanently removed."
                        onConfirm={() => remove.mutate(p.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Delete project">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectDialog open={open} onOpenChange={setOpen} project={editing} />
    </div>
  );
}
