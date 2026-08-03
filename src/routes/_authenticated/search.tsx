import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses, useProjects } from "@/lib/data";
import { categoryLabel, formatDate, formatMoney, statusLabel, statusStyles } from "@/lib/domain";
import { cn } from "@/lib/utils";

type SearchParams = { q: string };

export const Route = createFileRoute("/_authenticated/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search['q'] === "string" ? search['q'] : "",
  }),
  head: () => ({
    meta: [
      { title: "Search — SiteLedger" },
      { name: "description", content: "Search across construction projects, clients and expenses." },
      { property: "og:title", content: "Search — SiteLedger" },
      { property: "og:description", content: "Find any project, client or expense instantly." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: projects = [] } = useProjects();
  const { data: expenses = [] } = useExpenses();

  const term = q.trim().toLowerCase();
  const projectName = (id: string) => projects.find((p) => p.id === id)?.project_name ?? "—";

  const matchedProjects = term
    ? projects.filter((p) =>
        [p.project_name, p.client_name, p.location, p.phone].some((v) =>
          (v ?? "").toLowerCase().includes(term),
        ),
      )
    : [];

  const matchedExpenses = term
    ? expenses.filter((e) =>
        [e.description, categoryLabel(e.category), projectName(e.project_id)].some((v) =>
          v.toLowerCase().includes(term),
        ),
      )
    : [];

  const nothing = term && matchedProjects.length === 0 && matchedExpenses.length === 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Search</h1>
        <p className="text-sm text-muted-foreground">
          {term ? `Results for “${q}”` : "Type in the search bar above to find projects, clients or expenses."}
        </p>
      </div>

      {nothing ? (
        <EmptyState icon={SearchX} title="Nothing found" description="Try a different project, client or keyword." />
      ) : null}

      {matchedProjects.length > 0 && (
        <Card className="rounded-2xl shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Projects & clients ({matchedProjects.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {matchedProjects.map((p) => (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.project_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.client_name || "—"} · {p.location || "—"}
                  </p>
                </div>
                <Badge variant="outline" className={cn("shrink-0", statusStyles[p.status])}>
                  {statusLabel(p.status)}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {matchedExpenses.length > 0 && (
        <Card className="rounded-2xl shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expenses ({matchedExpenses.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {matchedExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.description || categoryLabel(e.category)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {projectName(e.project_id)} · {categoryLabel(e.category)} · {formatDate(e.expense_date)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">{formatMoney(e.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
