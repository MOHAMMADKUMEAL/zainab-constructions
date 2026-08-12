import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type {
  AgreementPayment,
  Expense,
  Investment,
  InvestmentInvestor,
  Payment,
  Project,
  ProjectNote,
  PropertyAgreement,
} from "./domain";

type Insert<T> = Partial<T> & Record<string, unknown>;


/* ---------------------------------- reads --------------------------------- */

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useExpenses(projectId?: string) {
  return useQuery({
    queryKey: ["expenses", projectId ?? "all"],
    queryFn: async (): Promise<Expense[]> => {
      let q = supabase.from("expenses").select("*").order("expense_date", { ascending: false });
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePayments(projectId?: string) {
  return useQuery({
    queryKey: ["payments", projectId ?? "all"],
    queryFn: async (): Promise<Payment[]> => {
      let q = supabase.from("payments").select("*").order("payment_date", { ascending: false });
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProjectNotes(projectId: string) {
  return useQuery({
    queryKey: ["project_notes", projectId],
    queryFn: async (): Promise<ProjectNote[]> => {
      const { data, error } = await supabase
        .from("project_notes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],
    queryFn: async (): Promise<Investment[]> => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInvestmentInvestors() {
  return useQuery({
    queryKey: ["investment_investors"],
    queryFn: async (): Promise<InvestmentInvestor[]> => {
      const { data, error } = await supabase
        .from("investment_investors")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePropertyAgreements() {
  return useQuery({
    queryKey: ["property_agreements"],
    queryFn: async (): Promise<PropertyAgreement[]> => {
      const { data, error } = await supabase
        .from("property_agreements")
        .select("*")
        .order("agreement_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAgreementPayments() {
  return useQuery({
    queryKey: ["agreement_payments"],
    queryFn: async (): Promise<AgreementPayment[]> => {
      const { data, error } = await supabase
        .from("agreement_payments")
        .select("*")
        .order("payment_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* --------------------------------- writes --------------------------------- */

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["expenses"] });
    qc.invalidateQueries({ queryKey: ["payments"] });
    qc.invalidateQueries({ queryKey: ["project_notes"] });
    qc.invalidateQueries({ queryKey: ["investments"] });
    qc.invalidateQueries({ queryKey: ["investment_investors"] });
    qc.invalidateQueries({ queryKey: ["property_agreements"] });
    qc.invalidateQueries({ queryKey: ["agreement_payments"] });
  };
}

type Table =
  | "projects"
  | "expenses"
  | "payments"
  | "project_notes"
  | "investments"
  | "investment_investors"
  | "property_agreements"
  | "agreement_payments";


export function useSaveRow<T>(table: Table, labels: { created: string; updated: string }) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: Insert<T> }) => {
      if (id) {
        const { error } = await supabase.from(table).update(values as never).eq("id", id);
        if (error) throw error;
        return "updated" as const;
      }
      const { error } = await supabase.from(table).insert(values as never);
      if (error) throw error;
      return "created" as const;
    },
    onSuccess: (mode) => {
      invalidate();
      toast.success(mode === "created" ? labels.created : labels.updated);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRow(table: Table, label: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success(label);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
