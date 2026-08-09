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
  type Project,
} from "./domain";

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
