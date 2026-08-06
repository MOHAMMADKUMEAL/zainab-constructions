import type { Database } from "@/integrations/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type ProjectNote = Database["public"]["Tables"]["project_notes"]["Row"];
export type Investment = Database["public"]["Tables"]["investments"]["Row"];
export type InvestmentInvestor = Database["public"]["Tables"]["investment_investors"]["Row"];

export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type ExpenseCategory = Database["public"]["Enums"]["expense_category"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "material", label: "Material" },
  { value: "labour", label: "Labour" },
  { value: "goundi", label: "Goundi" },
  { value: "shentring_mestri", label: "Shentring Mestri" },
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "painter", label: "Painter" },
  { value: "tiles", label: "Tiles" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
];

export const statusLabel = (s: ProjectStatus) =>
  PROJECT_STATUSES.find((x) => x.value === s)?.label ?? s;
export const categoryLabel = (c: ExpenseCategory) =>
  EXPENSE_CATEGORIES.find((x) => x.value === c)?.label ?? c;
export const methodLabel = (m: PaymentMethod) =>
  PAYMENT_METHODS.find((x) => x.value === m)?.label ?? m;

export const statusStyles: Record<ProjectStatus, string> = {
  planning: "bg-info/12 text-info border-info/25",
  running: "bg-accent/15 text-accent-foreground border-accent/35 dark:text-accent",
  completed: "bg-success/12 text-success border-success/25",
  on_hold: "bg-muted text-muted-foreground border-border",
};

export function formatMoney(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatCompactMoney(value: number): string {
  return "₹" + new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function monthKey(value: string): string {
  return value.slice(0, 7);
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(d);
}

export function lastMonths(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export const sum = (rows: { amount: number | string }[]) =>
  rows.reduce((acc, r) => acc + Number(r.amount ?? 0), 0);
