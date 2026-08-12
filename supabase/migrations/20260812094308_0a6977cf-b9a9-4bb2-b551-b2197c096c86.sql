ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'tiles_fitter';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'tiles_material';

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS plot_length numeric,
  ADD COLUMN IF NOT EXISTS plot_width numeric,
  ADD COLUMN IF NOT EXISTS rate_per_sqft numeric;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS expense_id uuid REFERENCES public.expenses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'in';

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_direction_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_direction_check CHECK (direction IN ('in', 'out'));

CREATE INDEX IF NOT EXISTS payments_expense_id_idx ON public.payments (expense_id);

CREATE TABLE IF NOT EXISTS public.property_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  investment_id uuid REFERENCES public.investments(id) ON DELETE SET NULL,
  property_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  agreement_date date NOT NULL DEFAULT CURRENT_DATE,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  notes text NOT NULL DEFAULT '',
  document_path text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_agreements TO authenticated;
GRANT ALL ON public.property_agreements TO service_role;
ALTER TABLE public.property_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own property agreements" ON public.property_agreements
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.agreement_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  agreement_id uuid NOT NULL REFERENCES public.property_agreements(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agreement_payments TO authenticated;
GRANT ALL ON public.agreement_payments TO service_role;
ALTER TABLE public.agreement_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own agreement payments" ON public.agreement_payments
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS agreement_payments_agreement_id_idx ON public.agreement_payments (agreement_id);