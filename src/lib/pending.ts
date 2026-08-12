import type { Expense, ExpenseCategory, Payment } from "./domain";

export type PayStatus = "pending" | "partial" | "paid";

export const PAY_STATUS_LABEL: Record<PayStatus, string> = {
  pending: "Pending",
  partial: "Partially Paid",
  paid: "Fully Paid",
};

export const PAY_STATUS_STYLES: Record<PayStatus, string> = {
  pending: "bg-destructive/12 text-destructive border-destructive/25",
  partial: "bg-info/12 text-info border-info/25",
  paid: "bg-success/12 text-success border-success/25",
};

/** Payments made out to a vendor / worker (as opposed to money received from a client). */
export const isOutgoing = (p: Payment) => p.direction === "out";

/** Goundi is priced by area: length x width x rate. */
export function goundiArea(e: Pick<Expense, "plot_length" | "plot_width">): number {
  const l = Number(e.plot_length ?? 0);
  const w = Number(e.plot_width ?? 0);
  return l > 0 && w > 0 ? l * w : 0;
}

export function finalizedAmount(e: Expense): number {
  const area = goundiArea(e);
  const rate = Number(e.rate_per_sqft ?? 0);
  if (area > 0 && rate > 0) return area * rate;
  return Number(e.amount ?? 0);
}

export function paymentsFor(expenseId: string, payments: Payment[]): Payment[] {
  return payments.filter((p) => p.expense_id === expenseId);
}

export function paidFor(expenseId: string, payments: Payment[]): number {
  return paymentsFor(expenseId, payments).reduce((a, p) => a + Number(p.amount ?? 0), 0);
}

export function statusOf(finalized: number, paid: number): PayStatus {
  if (paid <= 0) return "pending";
  if (paid >= finalized - 0.5) return "paid";
  return "partial";
}

export type PendingSummary = {
  expense: Expense;
  finalized: number;
  paid: number;
  remaining: number;
  status: PayStatus;
  history: Payment[];
};

export function summarise(expense: Expense, payments: Payment[]): PendingSummary {
  const finalized = finalizedAmount(expense);
  const history = paymentsFor(expense.id, payments).sort((a, b) =>
    a.payment_date < b.payment_date ? -1 : 1,
  );
  const paid = history.reduce((a, p) => a + Number(p.amount ?? 0), 0);
  return {
    expense,
    finalized,
    paid,
    remaining: Math.max(finalized - paid, 0),
    status: statusOf(finalized, paid),
    history,
  };
}

export type CategorySummary = {
  category: ExpenseCategory;
  entries: PendingSummary[];
  finalized: number;
  paid: number;
  remaining: number;
  status: PayStatus;
  history: Payment[];
};

export function summariseCategory(
  category: ExpenseCategory,
  expenses: Expense[],
  payments: Payment[],
): CategorySummary {
  const entries = expenses
    .filter((e) => e.category === category)
    .map((e) => summarise(e, payments));
  const finalized = entries.reduce((a, e) => a + e.finalized, 0);
  const paid = entries.reduce((a, e) => a + e.paid, 0);
  const history = entries
    .flatMap((e) => e.history)
    .sort((a, b) => (a.payment_date < b.payment_date ? -1 : 1));
  return {
    category,
    entries,
    finalized,
    paid,
    remaining: Math.max(finalized - paid, 0),
    status: statusOf(finalized, paid),
    history,
  };
}
