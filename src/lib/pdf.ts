import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  categoryLabel,
  formatDate,
  formatMoney,
  methodLabel,
  statusLabel,
  sum,
  type Expense,
  type Payment,
  type AgreementPayment,
  type Project,
  type PropertyAgreement,
} from "./domain";
import { PAY_STATUS_LABEL, type CategorySummary, type PendingSummary } from "./pending";

const BRAND = "Zainab Constructions";

const money = (v: number | string) => formatMoney(v).replace("₹", "Rs. ");

function header(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(BRAND, 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(title, 14, 26);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(subtitle ? `${subtitle} · Generated ${formatDate(new Date().toISOString())}` : `Generated ${formatDate(new Date().toISOString())}`, 14, 32);
  doc.setTextColor(0);
}

function lastY(doc: jsPDF) {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

function totalsLine(doc: jsPDF, text: string) {
  const y = lastY(doc) + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(text, 14, y);
  doc.setFont("helvetica", "normal");
}

function finish(doc: jsPDF, filename: string) {
  doc.save(filename);
}

export function downloadExpensesPdf(expenses: Expense[], projectName: (id: string) => string) {
  const doc = new jsPDF();
  const total = sum(expenses);
  header(doc, "Expenses report", `${expenses.length} entries · Total ${money(total)}`);
  autoTable(doc, {
    startY: 40,
    head: [["Date", "Project", "Category", "Description", "Amount"]],
    body: expenses.map((e) => [
      formatDate(e.expense_date),
      projectName(e.project_id),
      categoryLabel(e.category),
      e.description || "-",
      money(e.amount),
    ]),
    foot: [["", "", "", "Total expenses", money(total)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });
  totalsLine(doc, `Total expenses: ${money(total)}`);
  finish(doc, "expenses-report.pdf");
}

export function downloadPaymentsPdf(payments: Payment[], projectName: (id: string) => string) {
  const doc = new jsPDF();
  const total = sum(payments);
  header(doc, "Payments report", `${payments.length} entries · Total ${money(total)}`);
  autoTable(doc, {
    startY: 40,
    head: [["Date", "Project", "Method", "Notes", "Amount"]],
    body: payments.map((p) => [
      formatDate(p.payment_date),
      projectName(p.project_id),
      methodLabel(p.payment_method),
      p.notes || "-",
      money(p.amount),
    ]),
    foot: [["", "", "", "Total payments received", money(total)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });
  totalsLine(doc, `Total payments received: ${money(total)}`);
  finish(doc, "payments-report.pdf");
}

export function downloadProjectSummaryPdf(
  project: Project,
  expenses: Expense[],
  payments: Payment[],
) {
  const doc = new jsPDF();
  const spent = sum(expenses);
  const received = sum(payments);
  header(doc, `Project summary — ${project.project_name}`, project.location || undefined);

  autoTable(doc, {
    startY: 40,
    theme: "plain",
    body: [
      ["Client", project.client_name || "-", "Phone", project.phone || "-"],
      ["Location", project.location || "-", "Start date", formatDate(project.start_date)],
      ["Status", statusLabel(project.status), "Budget", money(project.budget)],
      ["Total expenses", money(spent), "Payments received", money(received)],
      ["Balance (budget - received)", money(Number(project.budget ?? 0) - received), "Received - spent", money(received - spent)],
    ],
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold" }, 2: { fontStyle: "bold" } },
  });

  let y = lastY(doc) + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Expenses", 14, y);
  autoTable(doc, {
    startY: y + 3,
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenses.length
      ? expenses.map((e) => [
          formatDate(e.expense_date),
          categoryLabel(e.category),
          e.description || "-",
          money(e.amount),
        ])
      : [["-", "-", "No expenses recorded", "-"]],
    foot: [["", "", "Total expenses", money(spent)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });

  y = lastY(doc) + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Payments", 14, y);
  autoTable(doc, {
    startY: y + 3,
    head: [["Date", "Method", "Notes", "Amount"]],
    body: payments.length
      ? payments.map((p) => [
          formatDate(p.payment_date),
          methodLabel(p.payment_method),
          p.notes || "-",
          money(p.amount),
        ])
      : [["-", "-", "No payments recorded", "-"]],
    foot: [["", "", "Total payments received", money(received)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });

  y = lastY(doc) + 10;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    body: [
      ["Total expenses", money(spent)],
      ["Total payments received", money(received)],
      ["Balance (budget - received)", money(Number(project.budget ?? 0) - received)],
      ["Received - spent", money(received - spent)],
    ],
    styles: { fontSize: 10, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
  });

  finish(doc, `${project.project_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-summary.pdf`);
}

/* ---------------------- pending payments & categories ---------------------- */

export function downloadKharchaPdf(expenses: Expense[], projectName: (id: string) => string) {
  const doc = new jsPDF();
  const total = sum(expenses);
  header(doc, "Kharcha report", `${expenses.length} entries · Total ${money(total)}`);
  autoTable(doc, {
    startY: 40,
    head: [["Date", "Project", "Details", "Notes", "Amount"]],
    body: expenses.length
      ? expenses.map((e) => [
          formatDate(e.expense_date),
          projectName(e.project_id),
          e.description || "-",
          e.notes || "-",
          money(e.amount),
        ])
      : [["-", "-", "No kharcha recorded", "-", "-"]],
    foot: [["", "", "", "Total kharcha", money(total)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });
  totalsLine(doc, `Total kharcha: ${money(total)}`);
  finish(doc, "kharcha-report.pdf");
}



export function downloadPendingPaymentsPdf(
  rows: PendingSummary[],
  projectName: (id: string) => string,
) {
  const doc = new jsPDF();
  const finalized = rows.reduce((a, r) => a + r.finalized, 0);
  const paid = rows.reduce((a, r) => a + r.paid, 0);
  const remaining = rows.reduce((a, r) => a + r.remaining, 0);
  header(doc, "Pending payments report", `${rows.length} entries · ${money(remaining)} remaining`);
  autoTable(doc, {
    startY: 40,
    head: [["Date", "Project", "Category", "Details", "Finalized", "Paid", "Remaining", "Status"]],
    body: rows.map((r) => [
      formatDate(r.expense.expense_date),
      projectName(r.expense.project_id),
      categoryLabel(r.expense.category),
      r.expense.description || "-",
      money(r.finalized),
      money(r.paid),
      money(r.remaining),
      PAY_STATUS_LABEL[r.status],
    ]),
    foot: [["", "", "", "Totals", money(finalized), money(paid), money(remaining), ""]],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });
  totalsLine(
    doc,
    `Finalized: ${money(finalized)}   Paid: ${money(paid)}   Remaining: ${money(remaining)}`,
  );
  finish(doc, "pending-payments-report.pdf");
}

export function downloadCategoryPdf(
  summary: CategorySummary,
  projectName: (id: string) => string,
) {
  const doc = new jsPDF();
  const label = categoryLabel(summary.category);
  header(
    doc,
    `${label} — payment report`,
    `${summary.entries.length} work entries · ${money(summary.remaining)} remaining`,
  );

  autoTable(doc, {
    startY: 40,
    head: [["Date", "Project", "Details", "Area / rate", "Finalized", "Paid", "Remaining", "Status"]],
    body: summary.entries.length
      ? summary.entries.map((r) => {
          const l = Number(r.expense.plot_length ?? 0);
          const w = Number(r.expense.plot_width ?? 0);
          const rate = Number(r.expense.rate_per_sqft ?? 0);
          const dims = l > 0 && w > 0 ? `${l} x ${w} = ${l * w} sqft @ Rs. ${rate}` : "-";
          return [
            formatDate(r.expense.expense_date),
            projectName(r.expense.project_id),
            r.expense.description || "-",
            dims,
            money(r.finalized),
            money(r.paid),
            money(r.remaining),
            PAY_STATUS_LABEL[r.status],
          ];
        })
      : [["-", "-", "No entries recorded", "-", "-", "-", "-", "-"]],
    foot: [
      [
        "",
        "",
        "",
        "Totals",
        money(summary.finalized),
        money(summary.paid),
        money(summary.remaining),
        "",
      ],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });

  const y = lastY(doc) + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Payment history", 14, y);
  autoTable(doc, {
    startY: y + 3,
    head: [["Date", "Project", "Method", "Notes", "Amount"]],
    body: summary.history.length
      ? summary.history.map((p) => [
          formatDate(p.payment_date),
          projectName(p.project_id),
          methodLabel(p.payment_method),
          p.notes || "-",
          money(p.amount),
        ])
      : [["-", "-", "-", "No payments made yet", "-"]],
    foot: [["", "", "", "Total paid", money(summary.paid)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });

  totalsLine(
    doc,
    `Finalized: ${money(summary.finalized)}   Paid: ${money(summary.paid)}   Remaining: ${money(summary.remaining)}`,
  );
  finish(doc, `${summary.category}-payment-report.pdf`);
}

export function downloadAgreementPdf(
  agreement: PropertyAgreement,
  payments: AgreementPayment[],
) {
  const doc = new jsPDF();
  const paid = payments.reduce((a, p) => a + Number(p.amount ?? 0), 0);
  const total = Number(agreement.total_amount ?? 0);
  header(doc, `Agreement — ${agreement.property_name}`, agreement.description || undefined);

  autoTable(doc, {
    startY: 40,
    theme: "plain",
    body: [
      ["Description", agreement.description || "-", "Agreement date", formatDate(agreement.agreement_date)],
      ["Total agreed amount", money(total), "Advance / paid", money(paid)],
      ["Balance remaining", money(Math.max(total - paid, 0)), "Notes", agreement.notes || "-"],
    ],
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold" }, 2: { fontStyle: "bold" } },
  });

  const y = lastY(doc) + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Advance payment history", 14, y);
  autoTable(doc, {
    startY: y + 3,
    head: [["Date", "Method", "Notes", "Amount"]],
    body: payments.length
      ? payments.map((p) => [
          formatDate(p.payment_date),
          methodLabel(p.payment_method),
          p.notes || "-",
          money(p.amount),
        ])
      : [["-", "-", "No payments recorded", "-"]],
    foot: [["", "", "Total paid", money(paid)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
    footStyles: { fillColor: [235, 238, 243], textColor: 20, fontStyle: "bold" },
  });

  totalsLine(doc, `Total ${money(total)}   Paid ${money(paid)}   Balance ${money(Math.max(total - paid, 0))}`);
  finish(doc, `${agreement.property_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-agreement.pdf`);
}
