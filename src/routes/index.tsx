import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, HardHat, Receipt, Wallet, FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SiteLedger — Construction Project & Expense Manager" },
      {
        name: "description",
        content:
          "Track construction projects, site expenses and client payments in rupees with a simple, private dashboard.",
      },
      { property: "og:title", content: "SiteLedger — Construction Project Manager" },
      {
        property: "og:description",
        content: "Projects, expenses and client payments in one clean dashboard.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FolderKanban, title: "Projects", text: "Budget, client, site status at a glance." },
  { icon: Receipt, title: "Expenses", text: "Material, labour and trade-wise spending." },
  { icon: Wallet, title: "Payments", text: "Received amounts and remaining balance." },
];

function Landing() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <span className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="font-display font-semibold">SiteLedger</span>
        </span>
        <Button asChild variant="outline" size="sm">
          <Link to={signedIn ? "/dashboard" : "/auth"}>{signedIn ? "Open dashboard" : "Sign in"}</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24">
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-16 shadow-card sm:px-12 sm:py-24">
          <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground dark:text-accent">
              Site money, under control
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Every project, expense and client payment in one place.
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              A simple construction manager built for contractors — track budgets in rupees, log
              material and labour costs, and always know the remaining balance.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to={signedIn ? "/dashboard" : "/auth"}>
                {signedIn ? "Open dashboard" : "Get started"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
              <f.icon className="h-5 w-5 text-accent-foreground dark:text-accent" />
              <h2 className="mt-3 font-display text-base font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
