# Zainab Constructions — feature update

Six changes: rebrand, new expense categories, payment screenshots, project maps, PDF reports, and an Investments section.

## 1. Rebrand to Zainab Constructions

Replace "SiteLedger" everywhere: sidebar, landing page, auth page, and every page title / social preview tag.

## 2. New expense categories

Add **Goundi** and **Shentring Mestri** to the expense category list, keeping all existing ones (material, labour, plumber, electrician, painter, tiles, transport, other). They appear in the expense form, filters, and the dashboard breakdown.

## 3. Payment screenshots

- New private file storage for payment proofs; each user can only read their own uploads.
- The payment form gets an optional "Payment screenshot" upload (image, useful for UPI / bank transfers).
- Payment rows show a small thumbnail; clicking opens the full image. Uploads can be replaced or removed when editing.

## 4. Google Map per project

- The project detail page shows a map with a pin at the project's location, geocoded from the location text.
- Locations that can't be found show a friendly "location not found" note instead of a broken map.
- This needs the Google Maps connector — a connect card will appear during the build; the map only works once it's linked.

## 5. PDF downloads

Three "Download PDF" actions, generated in the browser:
- Expenses list (respecting current filters) with total.
- Payments list (respecting current filters) with total.
- Full project summary: client details, budget, status, expense breakdown by category, payments received, balance/profit figures, and notes.

Each PDF is headed "Zainab Constructions" with the generation date.

## 6. Investments section

New sidebar entry **Investments** with its own page:
- Each investment record: property/land name, location, purchase amount, purchase date, notes, and an optional **Sold for** amount plus sold date.
- Each investment holds a list of **investors** — person's name and amount invested.
- Automatic calculations: total invested, profit or loss (sold amount minus purchase amount) shown once "sold for" is filled, and each investor's share of the profit proportional to their contribution.
- Summary cards at the top: total invested, total sold, net profit.

## Technical notes

- Migration: add two values to `expense_category`; add `screenshot_url` to `payments`; create `investments` and `investment_investors` tables with owner-scoped RLS and grants; create a private `payment-screenshots` storage bucket with per-user object policies.
- Maps: `standard_connectors--connect` for `google_maps`; geocoding runs through the connector gateway inside a `createServerFn`, with the coordinates rendered by the Maps JS API using the browser key.
- PDFs: `jspdf` + `jspdf-autotable`, generated client-side from data already loaded by React Query.
- New files: `src/lib/pdf.ts`, `src/components/project-map.tsx`, `src/components/investment-dialog.tsx`, `src/routes/_authenticated/investments.tsx`, plus updates to `domain.ts`, `data.ts`, the payment dialog, and the pages listed above.
