import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  HardHat,
  Home,
  LandPlot,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/zainab-logo.png.asset.json";
import work1 from "@/assets/work1.jpg.asset.json";
import work2 from "@/assets/work2.jpg.asset.json";
import work3 from "@/assets/work3.jpg.asset.json";
import work4 from "@/assets/work4.jpg.asset.json";

const COMPANY = "Zainab Construction & Real Estate";
const ADDRESS =
  "Plot No. 37, Sy No. 55/3/3b, Siddeshwar Nagar, Bauxite Road, Near Razaye Mustafa Colony, Po: Nehru Nagar, Belagavi - 590 010";
const CONTACTS = [
  { name: "Arfat Hanchanmani", phone: "+91 96321 69834", tel: "+919632169834" },
  { name: "Tousif Shaikh", phone: "+91 98450 73900", tel: "+919845073900" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zainab Construction & Real Estate — Belagavi Building Contractor" },
      {
        name: "description",
        content:
          "Building contractor in Belagavi for house construction, plot and land sale or purchase. Call Arfat +91 96321 69834 or Tousif +91 98450 73900.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Zainab Construction & Real Estate — Belagavi" },
      {
        property: "og:description",
        content: "House construction, building contracting and plot/land sale or purchase in Belagavi.",
      },
      { property: "og:url", content: "https://buildbook-pro-62.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buildbook-pro-62.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GeneralContractor",
          name: COMPANY,
          telephone: CONTACTS.map((c) => c.phone),
          address: {
            "@type": "PostalAddress",
            streetAddress: "Plot No. 37, Sy No. 55/3/3b, Siddeshwar Nagar, Bauxite Road",
            addressLocality: "Belagavi",
            addressRegion: "Karnataka",
            postalCode: "590010",
            addressCountry: "IN",
          },
          areaServed: "Belagavi, Karnataka",
        }),
      },
    ],
  }),
  component: Portfolio,
});

const services = [
  {
    icon: HardHat,
    title: "Building contractor",
    text: "End-to-end civil contracting — foundation to finishing, with transparent costing.",
  },
  {
    icon: Home,
    title: "House construction",
    text: "Independent houses and duplexes built to plan, on schedule and on budget.",
  },
  {
    icon: LandPlot,
    title: "Plot & land",
    text: "Buying and selling of residential plots and agricultural land in and around Belagavi.",
  },
  {
    icon: Building2,
    title: "Commercial works",
    text: "Shops, offices and rental buildings, including renovation and extension work.",
  },
];

const works = [
  { img: work1.url, title: "Residential villa", text: "Two-storey house, Siddeshwar Nagar" },
  { img: work2.url, title: "RCC structure", text: "Frame work in progress, Nehru Nagar" },
  { img: work3.url, title: "Plot development", text: "Compound wall and levelling" },
  { img: work4.url, title: "Interior finishing", text: "Flooring, ceiling and painting" },
];

const stats = [
  { value: "15+", label: "Years on site" },
  { value: "120+", label: "Projects delivered" },
  { value: "100%", label: "Client-owned budgets" },
];

function Portfolio() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <span className="flex items-center gap-2.5">
            <img
              src={logoAsset.url}
              alt={`${COMPANY} logo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain"
            />
            <span className="font-display text-sm font-semibold leading-tight sm:text-base">
              Zainab Construction
              <span className="block text-xs font-normal text-muted-foreground">& Real Estate</span>
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={`tel:${CONTACTS[0]!.tel}`}>
                <Phone className="h-4 w-4" /> Call us
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={signedIn ? "/dashboard" : "/auth"}>{signedIn ? "Dashboard" : "Owner login"}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        {/* Hero */}
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-14 shadow-card sm:px-12 sm:py-20">
          <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground dark:text-accent">
              Building contractor · Belagavi
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              We build houses, and we handle your plot and land deals.
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              {COMPANY} takes on house construction, civil contracting and property sale or purchase
              across Belagavi — one team from drawing to handover.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#contact">
                  Talk to us <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#works">See our work</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
              <p className="font-display text-3xl font-semibold">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        {/* About */}
        <section className="mt-12 grid gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-card sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold">About the company</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Run by Arfat Hanchanmani and Tousif Shaikh, {COMPANY} is a Belagavi-based building
              contractor and real estate firm. We take on residential and commercial construction,
              and help clients buy or sell houses, plots and land with clear paperwork.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every site is tracked in-house — material, labour and payments — so you always know
              exactly where the money went.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, t: "Transparent billing" },
              { icon: Ruler, t: "Quality supervision" },
              { icon: HardHat, t: "Experienced site team" },
              { icon: LandPlot, t: "Verified land deals" },
            ].map((f) => (
              <li
                key={f.t}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-4"
              >
                <f.icon className="h-5 w-5 shrink-0 text-accent-foreground dark:text-accent" />
                <span className="text-sm font-medium">{f.t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Services */}
        <section id="services" className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Our services</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Building contractor · House / Plot / Land — sell or purchase
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
                <s.icon className="h-5 w-5 text-accent-foreground dark:text-accent" />
                <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Works */}
        <section id="works" className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Recent works</h2>
          <p className="mt-1 text-sm text-muted-foreground">A sample of completed and ongoing sites.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {works.map((w) => (
              <figure
                key={w.title}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
              >
                <img
                  src={w.img}
                  alt={w.title}
                  width={1024}
                  height={768}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
                <figcaption className="p-4">
                  <p className="font-display text-base font-semibold">{w.title}</p>
                  <p className="text-sm text-muted-foreground">{w.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="mt-12 rounded-3xl border border-border/70 bg-card p-6 shadow-card sm:p-10"
        >
          <h2 className="font-display text-2xl font-semibold">Contact us</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {CONTACTS.map((c) => (
              <a
                key={c.tel}
                href={`tel:${c.tel}`}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:bg-secondary"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <Phone className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block text-sm text-muted-foreground">{c.phone}</span>
                </span>
              </a>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground dark:text-accent" />
            <div>
              <p className="text-sm font-semibold">Office address</p>
              <p className="mt-1 text-sm text-muted-foreground">{ADDRESS}</p>
              <a
                className="mt-2 inline-block text-sm font-medium underline underline-offset-4"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} {COMPANY}, Belagavi</span>
          <Link to={signedIn ? "/dashboard" : "/auth"} className="underline underline-offset-4">
            {signedIn ? "Open dashboard" : "Owner login"}
          </Link>
        </div>
      </footer>
    </div>
  );
}
