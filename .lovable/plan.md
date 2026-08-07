# Plan: In-App Data Manager & Safety Center

You asked how to see database entries, manage them, and keep data safe. This plan adds a single "Data & Safety" screen inside Zainab Constructions so you can browse every record you own and export/back it up without leaving the app.

## What we'll build

1. **New "Data & Safety" page** (`/_authenticated/data-safety`)
   - Tabbed data browser: Projects, Expenses, Payments, Investments, Investors.
   - Each tab shows a searchable/sortable table with key fields.
   - Inline row actions: edit (opens existing dialog) and delete (with confirmation).
   - Read-only safety panel showing:
     - Authentication status.
     - Row Level Security (RLS) summary: "Each user only sees their own records."
     - Storage bucket status for payment screenshots.
     - Last backup/export timestamp.

2. **Export & backup controls**
   - "Export as CSV" button on every tab.
   - "Download full backup" button that zips all five tables into CSV files in the browser.
   - Uses client-side data already fetched by React Query — no extra server dependency.

3. **Navigation**
   - Add "Data & Safety" to the app sidebar, grouped under Manage.

4. **Safety hardening (no schema changes)**
   - Verify existing RLS policies are intact.
   - Add a client-side reminder to use a strong password / Google sign-in.
   - Keep all data access through authenticated Supabase client so RLS is enforced.

## Out of scope

- No new database tables or migrations.
- No admin access to other users' data (RLS prevents this by design).
- No automated cloud backups (Lovable Cloud handles infrastructure backups; this gives you manual CSV exports).

## Files to create / modify

- Create `src/routes/_authenticated/data-safety.tsx`
- Create `src/components/data-table.tsx` (reusable searchable table)
- Create `src/lib/export-csv.ts` (CSV generation helper)
- Modify `src/components/app-sidebar.tsx` (add nav item)
- Modify `src/lib/domain.ts` if needed for export helpers

## Verification

- Typecheck passes.
- Route loads at `/data-safety` and shows all tabs populated with the signed-in user's data.
- CSV export downloads a valid file for each tab.
- Deleting a row refreshes the table and reflects in the rest of the app.
