# Build-From-Scratch Prompt: Zainab Constructions Manager

Use this document as a single mega-prompt for another AI coding tool. It describes the exact application built in this project so it can be reproduced as closely as possible.

---

## 1. Goal & scope

Build a **simple, responsive, personal-use Construction Project Management web app** branded **"Zainab Constructions"** (company legal name: **Zainab Construction & Real Estate**).

It is **not** a large ERP. It focuses on:
- Projects (construction sites)
- Expenses per project
- Client payments per project
- Land/property investments with multiple investors and profit tracking
- A public marketing/portfolio landing page before sign-up
- PDF reports for expenses, payments and per-project summaries

The app is for a single owner/operator; every authenticated user only sees their own data via Row Level Security.

---

## 2. Tech stack

- **Framework:** TanStack Start v1 with TanStack Router (file-based routing) and TanStack Query v5.
- **UI library:** React 19, TypeScript 5.8, Tailwind CSS v4 (native CSS `@theme` / `@import` style), shadcn/ui (New York style, Radix primitives).
- **Backend / auth / storage:** Supabase (Postgres, Auth, Storage).
- **Charts:** Recharts.
- **PDFs:** jspdf + jspdf-autotable (client-side generation).
- **Maps:** Google Maps JavaScript SDK loaded dynamically in the browser; geocoding through a server function proxy.
- **Fonts:** DM Sans (body) and Space Grotesk (headings), loaded via Google Fonts `<link>` in the root route head.
- **Icons:** Lucide React.
- **Toasts:** Sonner.
- **Forms:** react-hook-form + zod.

---

## 3. Database schema (Supabase migration)

Create three migrations in order.

### Migration 1 — core schema

```sql
CREATE TYPE public.project_status AS ENUM ('planning', 'running', 'completed', 'on_hold');
CREATE TYPE public.expense_category AS ENUM ('material', 'labour', 'plumber', 'electrician', 'painter', 'tiles', 'transport', 'other');
CREATE TYPE public.payment_method AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque');

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_name text NOT NULL,
  client_name text,
  phone text,
  location text,
  budget numeric(14,2),
  start_date date,
  status public.project_status NOT NULL DEFAULT 'planning',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category public.expense_category NOT NULL,
  description text,
  amount numeric(14,2) NOT NULL,
  expense_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX expenses_project_idx ON public.expenses(project_id);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  payment_method public.payment_method NOT NULL,
  payment_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_project_idx ON public.payments(project_id);

CREATE TABLE public.project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_notes_project_idx ON public.project_notes(project_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_notes TO authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT ALL ON public.expenses TO service_role;
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.project_notes TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own projects" ON public.projects FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own expenses" ON public.expenses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payments" ON public.payments FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own project notes" ON public.project_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Migration 2 — extra categories, screenshots, investments

```sql
ALTER TYPE public.expense_category ADD VALUE 'goundi';
ALTER TYPE public.expense_category ADD VALUE 'shentring_mestri';

ALTER TABLE public.payments ADD COLUMN screenshot_path text NOT NULL DEFAULT '';

CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  location text,
  purchase_amount numeric(14,2) NOT NULL,
  purchase_date date,
  sold_amount numeric(14,2),
  sold_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.investment_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  investor_name text NOT NULL,
  amount numeric(14,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_investors TO authenticated;
GRANT ALL ON public.investments TO service_role;
GRANT ALL ON public.investment_investors TO service_role;

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_investors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own investments" ON public.investments FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own investment investors" ON public.investment_investors FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Migration 3 — storage bucket for payment screenshots

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', false);

CREATE POLICY "Users can select their own screenshots" ON storage.objects FOR SELECT TO authenticated
  USING ((storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can insert their own screenshots" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update their own screenshots" ON storage.objects FOR UPDATE TO authenticated
  USING ((storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own screenshots" ON storage.objects FOR DELETE TO authenticated
  USING ((storage.foldername(name))[1] = auth.uid()::text);
```

---

## 4. Project file structure

```
src/
  routes/
    __root.tsx
    index.tsx                 # public portfolio landing page
    auth.tsx                  # sign-in / sign-up
    _authenticated/
      route.tsx               # auth layout (sidebar + header)
      dashboard.tsx
      projects.index.tsx
      projects.$id.tsx
      expenses.tsx
      payments.tsx
      investments.tsx
      search.tsx
  components/
    app-sidebar.tsx
    project-dialog.tsx
    expense-dialog.tsx
    payment-dialog.tsx        # includes screenshot upload
    investment-dialog.tsx     # multi-investor rows
    project-map.tsx           # Google Maps
    screenshot-link.tsx       # signed-url viewer
    stat-card.tsx
    empty-state.tsx
    confirm-delete.tsx
    theme-toggle.tsx
    ui/                       # shadcn/ui primitives
  lib/
    domain.ts                 # types, enums, formatters, sum
    data.ts                   # React Query hooks + mutations
    pdf.ts                    # PDF generation
    maps.functions.ts         # server geocode function
    utils.ts                  # cn() helper
  integrations/
    supabase/
      client.ts               # browser client
      client.server.ts        # service-role admin client
      auth-middleware.ts      # requireSupabaseAuth
      auth-attacher.ts        # attach bearer token to server fns
      types.ts                # generated Database type
    lovable/
      index.ts                # cloud auth wrapper
  hooks/
    use-theme.ts
    use-mobile.tsx
  styles.css                  # Tailwind v4 + theme tokens
  start.ts                    # start instance + middleware
  server.ts                   # Nitro error handling
  router.tsx
public/
  favicon.png
```

---

## 5. Design system tokens (`src/styles.css`)

Use Tailwind v4. Import `tailwindcss` and `tw-animate-css` at the top. Define light and dark `:root`/`.dark` custom properties in OKLCH:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent` (amber/gold ~65° hue), `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--success`, `--warning`, `--info`
- `--border`, `--input`, `--ring`
- 5 chart colors
- Sidebar palette variables
- `--radius: 0.85rem`
- `--shadow-card`
- `@utility surface-grid` for a faint grid background pattern

Add a dark-mode rule so native `<input type="date">` calendar icons are visible:

```css
.dark {
  color-scheme: dark;
}
.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
```

---

## 6. Routes & pages

### Public routes

- `/` — Portfolio landing page for **Zainab Construction & Real Estate**.
  - Sections: sticky header (logo, call button, owner login/dashboard link), hero with CTA, about/stats, services grid, recent works gallery, contact section (both phone numbers + address + map link), footer.
  - Use exact company details:
    - Company: Zainab Construction & Real Estate
    - Services: Building Contractor | House / Plot / Land — Sell or Purchase
    - Contacts:
      - Arfat Hanchanmani — +91 96321 69834
      - Tousif Shaikh — +91 98450 73900
    - Address: Plot No. 37, Sy No. 55/3/3b, Siddeshwar Nagar, Bauxite Road, Near Razaye Mustafa Colony, Po: Nehru Nagar, Belagavi - 590 010
  - Phone numbers must be `tel:` links.
  - SEO head: unique title, description, OG tags, canonical, plus `GeneralContractor` JSON-LD with the address and phone numbers.
  - Use a company logo image in the header instead of a generic yellow icon.
  - Demo works gallery: at least 4 project photos (house, construction site, land/plot, commercial/building).

- `/auth` — Sign-in / sign-up page.
  - Email + password forms (sign in and create account tabs).
  - "Continue with Google" button using Supabase/Lovable Cloud Auth OAuth.
  - Redirect authenticated users to `/dashboard`.

### Authenticated routes (under `/_authenticated` layout)

Layout requirements:
- `ssr: false`.
- `beforeLoad` checks `supabase.auth.getUser()` and redirects unauthenticated users to `/auth`.
- Renders `AppSidebar` + top header with global search, theme toggle and user sign-out.
- All loaders/components must respect Supabase auth: protected server functions only called from components/hooks, never from public-route loaders.

Pages:

1. `/dashboard`
   - KPI stat cards: total projects, active projects, total budget, total expenses, total payments received, balance (payments − expenses).
   - Monthly line chart: expenses vs payments over the last 6 months.
   - Project-wise expense bar chart.
   - Recent expenses and recent payments lists.
   - Quick-add buttons for project/expense/payment.

2. `/projects`
   - Searchable card grid of all projects.
   - Each card shows: project name, client, status badge, budget, total spent, total received, balance.
   - Edit/delete project; create new project via dialog.
   - Status options: Planning, Running, Completed, On Hold.

3. `/projects/$id`
   - Project detail page with tabs: Overview, Expenses, Payments, Notes.
   - Overview: project info, budget/spent/received/balance stats, Google Map of the location, edit/delete actions.
   - Expenses tab: list of expenses for this project with edit/delete.
   - Payments tab: list of payments with edit/delete and screenshot viewer.
   - Notes tab: simple CRUD text notes.
   - "Download Summary PDF" button.

4. `/expenses`
   - Global expense list.
   - Filters: search text, category select, date range (from/to).
   - Download PDF button.
   - Add/edit/delete expense.
   - Expense categories: Material, Labour, Goundi, Shentring Mestri, Plumber, Electrician, Painter, Tiles, Transport, Other.

5. `/payments`
   - Global payment list.
   - Filters: search text, payment method select.
   - Download PDF button.
   - Add/edit/delete payment; each payment can have a screenshot/receipt uploaded to Supabase Storage bucket `payment-screenshots` under path `<userId>/<uuid>.<ext>`.
   - Payment methods: Cash, UPI, Bank Transfer, Cheque.

6. `/investments`
   - List of land/property investments.
   - Each investment card shows: title, location, purchase amount, sold amount (or "Not sold yet"), profit/loss, investor breakdown.
   - Investor breakdown: each investor's name, contribution, percentage share, and proportional payout when sold.
   - Add/edit/delete investment via dialog that supports multiple investor rows.
   - Profit calculation: `sold_amount − purchase_amount` (only for sold investments).

7. `/search`
   - Global search results page driven by `?q=` param.
   - Searches projects (name, client, location, phone) and expenses (description, category).

---

## 7. Key components & hooks

- `AppSidebar`: collapsible sidebar with navigation links to Dashboard, Projects, Expenses, Payments, Investments. Shows company logo and brand name.
- `ProjectDialog`: form for project name, client, phone, location, budget, start date, status, notes.
- `ExpenseDialog`: form linked to a project, category, description, amount, date.
- `PaymentDialog`: form linked to a project, amount, method, date, notes, and a file input for screenshot upload to Supabase Storage.
- `InvestmentDialog`: form for investment title, location, purchase amount, purchase date, sold amount, sold date, notes, plus dynamic rows of investors (name + amount). On save, upsert the investment and replace all investor rows.
- `ProjectMap`: geocode the project address via a server function, then load the Google Maps JS SDK and render a map with a marker. If no API key or geocoding fails, show a friendly message card.
- `ScreenshotLink`: button that creates a Supabase signed URL for `payment-screenshots/<path>` and opens it in a new tab.
- `StatCard`, `EmptyState`, `ConfirmDelete`, `ThemeToggle`.
- `use-theme.ts`: persists theme in `localStorage` key `cpm-theme` and toggles `.dark` class.
- `use-mobile.tsx`: breakpoint at 768px.

---

## 8. Data layer (`src/lib/data.ts`)

Use TanStack Query and Supabase browser client.

Required hooks:
- `useProjects()` — all projects.
- `useProject(id)` — single project.
- `useExpenses()` — all expenses.
- `usePayments()` — all payments.
- `useProjectNotes(projectId)` — notes for a project.
- `useInvestments()` — all investments.
- `useInvestmentInvestors(investmentId)` — investors for an investment.
- `useSaveRow<T>(table, successMessage?)` — generic insert/update mutation that invalidates relevant query keys and toasts success.
- `useDeleteRow(table, successMessage?)` — generic delete mutation with confirmation toast.

All mutations should invalidate the related query keys and show Sonner toasts on success/error.

---

## 9. Domain helpers (`src/lib/domain.ts`)

Re-export generated Database row types for `projects`, `expenses`, `payments`, `project_notes`, `investments`, `investment_investors`.

Constants:
```ts
PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

EXPENSE_CATEGORIES = [
  { value: 'material', label: 'Material' },
  { value: 'labour', label: 'Labour' },
  { value: 'goundi', label: 'Goundi' },
  { value: 'shentring_mestri', label: 'Shentring Mestri' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'painter', label: 'Painter' },
  { value: 'tiles', label: 'Tiles' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];
```

Helpers:
- `statusLabel`, `categoryLabel`, `methodLabel`
- `statusStyles` record for badge colors
- `formatMoney(value)` → Indian Rupees `₹` with 0 decimals
- `formatCompactMoney(value)` → compact `₹` notation
- `formatDate(value)` → `dd MMM yyyy`
- `monthKey(value)`, `monthLabel(key)`, `lastMonths(count)`
- `sum(rows)` → sum of `amount`

---

## 10. PDF generation (`src/lib/pdf.ts`)

Use `jspdf` and `jspdf-autotable`. All PDFs are generated client-side and branded "Zainab Constructions". Amounts formatted as Indian Rupees with no decimals.

Functions:
- `downloadExpensesPdf(expenses, projectNameFn)`
  - Table columns: Date, Project, Category, Description, Amount.
  - Final bold total row.
  - Footer line: "Total expenses: ₹X".
  - Filename: `expenses-report.pdf`.

- `downloadPaymentsPdf(payments, projectNameFn)`
  - Table columns: Date, Project, Method, Notes, Amount.
  - Final bold total row.
  - Footer line: "Total payments received: ₹X".
  - Filename: `payments-report.pdf`.

- `downloadProjectSummaryPdf(project, expenses, payments)`
  - Header block: project name, client, phone, location, start date, status, budget, total expenses, total payments, balance.
  - Expenses table with total row.
  - Payments table with total row.
  - Final summary grid: Total Expenses, Total Payments Received, Balance (budget − received), Received − Spent.
  - Filename: `<project-name>-summary.pdf`.

---

## 11. Maps integration

Create a server function `geocodeAddress` in `src/lib/maps.functions.ts` using `createServerFn({ method: 'GET' })`.

- Validate input address.
- Call Lovable connector gateway: `https://connector-gateway.lovable.dev/google_maps/maps/api/geocode/json`.
- Headers: `Authorization: Bearer <LOVABLE_API_KEY>`, `X-Connection-Api-Key: <GOOGLE_MAPS_API_KEY>`.
- Return `{ lat, lng, error }`.

`ProjectMap` component:
- Use TanStack Query to call `geocodeAddress`.
- Dynamically inject `https://maps.googleapis.com/maps/api/js?key=<VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY>&loading=async&callback=...` script.
- Render `google.maps.Map` centered on geocoded coordinates with a marker.
- Show skeleton while loading; show message card if no key, no address, or geocoding fails.

---

## 12. Auth & middleware

- Browser Supabase client: `src/integrations/supabase/client.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Service-role admin client: `src/integrations/supabase/client.server.ts` using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Auth middleware: `requireSupabaseAuth` validates the Bearer token and exposes `context.supabase`, `userId`, and `claims`.
- Auth attacher: `attachSupabaseAuth` client-side middleware attaches the Supabase session access token to server function RPC headers.
- Register `attachSupabaseAuth` in `src/start.ts` as `functionMiddleware`.
- Social auth: use `@lovable.dev/cloud-auth-js` wrapper in `src/integrations/lovable/index.ts` for Google OAuth.

---

## 13. Environment variables

Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`
- `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` (optional)
- `GOOGLE_MAPS_API_KEY`
- `LOVABLE_API_KEY`

---

## 14. SEO / head metadata

Every route must define its own `head()` with:
- Unique `<title>` (never "Lovable App").
- `<meta name="description">`.
- OG tags: `og:title`, `og:description`, `og:type`.
- Twitter card tags.
- For `/`, also include a `GeneralContractor` JSON-LD schema with the company name, address, phone numbers, and URL.

---

## 15. Public assets

- Company logo: `src/assets/zainab-logo.png` (use a PNG with transparent or clean background).
- Demo works: `src/assets/work1.jpg`, `work2.jpg`, `work3.jpg`, `work4.jpg`.
- Favicon: `public/favicon.png`.

If the target platform supports Lovable Assets, use `.asset.json` manifests pointing to CDN URLs. Otherwise commit the images directly under `src/assets/` and `public/`.

---

## 16. Quality checks

Before finishing:
- Run TypeScript typecheck (`tsc --noEmit` or `tsgo`).
- Run ESLint.
- Verify the landing page loads at `/`.
- Verify sign-in redirects to `/dashboard`.
- Verify date inputs are visible in both light and dark themes.
- Verify downloaded PDFs show totals for expenses, payments, and project summaries.
- Verify the sidebar logo replaces any yellow placeholder icon.
