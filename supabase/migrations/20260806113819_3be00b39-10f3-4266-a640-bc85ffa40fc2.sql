ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'goundi';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'shentring_mestri';

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS screenshot_path text NOT NULL DEFAULT '';

CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  location text NOT NULL DEFAULT '',
  purchase_amount numeric NOT NULL DEFAULT 0,
  purchase_date date,
  sold_amount numeric,
  sold_date date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own investments" ON public.investments FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.investment_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  investor_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_investors TO authenticated;
GRANT ALL ON public.investment_investors TO service_role;
ALTER TABLE public.investment_investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own investment investors" ON public.investment_investors FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);