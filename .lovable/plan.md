# Plan: Portfolio site, dark-theme fixes, PDF totals

## 1. Date fields invisible in dark theme

All date pickers use native `<input type="date">`. In dark mode the browser's calendar icon renders black on a dark background.

- Add a dark-mode rule in `src/styles.css` that inverts the native calendar picker indicator (`::-webkit-calendar-picker-indicator`) and sets `color-scheme: dark` on the root when dark is active, so the popup calendar itself also renders dark.
- Affects: project, expense, payment, investment dialogs and the expenses date-range filters — no per-file changes needed.

## 2. Expenses page padding

- Rework `src/routes/_authenticated/expenses.tsx` spacing to match the Payments page: consistent card padding, aligned filter grid, even row padding and gaps on mobile and desktop.

## 3. PDF totals

In `src/lib/pdf.ts`:
- Expenses report: add a bold total row at the end of the table plus a summary line ("Total expenses").
- Payments report: same, with "Total payments received".
- Project summary: add a clear totals block showing total expenses, total payments received, and balance, and a total row under each of the two tables.

## 4. Yellow profile icon — where to change it

The yellow square with the hard-hat icon is the brand mark, defined in two places:

- `src/components/app-sidebar.tsx` (line ~34): `<span class="... bg-accent ..."><HardHat /></span>`
- `src/routes/index.tsx` (header, line ~43): same markup

To use a personal/company image, replace that span's icon with an `<img>` pointing at an uploaded asset. I'll wire the logo from your visiting card as a CDN asset and use it in both places, so the yellow block is gone.

## 5. Public portfolio website (before sign-up)

Replace the current landing page (`src/routes/index.tsx`) with a proper company portfolio, keeping the dashboard and everything behind sign-in exactly as it is. Details taken from your visiting card:

- **Company:** Zainab Construction & Real Estate
- **Services:** Building Contractor | House / Plot / Land — Sell or Purchase
- **Contacts:** Arfat Hanchanmani — +91 96321 69834; Tousif Shaikh — +91 98450 73900
- **Address:** Plot No. 37, Sy No. 55/3/3b, Siddeshwar Nagar, Bauxite Road, Near Razaye Mustafa Colony, Po: Nehru Nagar, Belagavi - 590 010

Sections:
1. Hero with logo, tagline, and call buttons (tap-to-call `tel:` links).
2. About the company.
3. Services grid (contracting, house construction, plot/land sale & purchase).
4. Demo works gallery — generated placeholder project photos with captions (replaceable with real site photos later).
5. Why choose us / stats strip.
6. Contact section: both phone numbers, address, and a map link.
7. Footer with a discreet "Owner login" link to `/auth`.

Design keeps the existing Blueprint theme tokens (dark/light safe), no new colors hardcoded.

## Technical notes

- Logo and demo-work images uploaded via Lovable Assets (CDN pointers), not committed binaries.
- Landing route gets its own SEO head: title, description, og tags, plus LocalBusiness JSON-LD with the address and phone numbers.
- No database or auth changes; `/dashboard`, projects, expenses, payments, investments untouched apart from the padding and PDF fixes above.

## Verification

- Typecheck passes.
- Date inputs and their popups readable in dark mode.
- Expenses page visually aligned with Payments.
- Downloaded PDFs show totals.
- Landing page renders portfolio content; sign-in still reachable.
