CREATE TABLE IF NOT EXISTS public.trade_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 255),
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trade_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.trade_customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'scheduled', 'in_progress', 'complete', 'cancelled')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trade_job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.trade_jobs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.trade_customers(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('permit', 'document', 'proposal', 'material')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  status TEXT NOT NULL DEFAULT 'open',
  due_date DATE,
  amount NUMERIC(12,2) CHECK (amount IS NULL OR amount >= 0),
  quantity NUMERIC(12,2) CHECK (quantity IS NULL OR quantity >= 0),
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_job_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients manage own trade customers" ON public.trade_customers FOR ALL
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients manage own trade jobs" ON public.trade_jobs FOR ALL
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients manage own trade job items" ON public.trade_job_items FOR ALL
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);

CREATE INDEX IF NOT EXISTS idx_trade_customers_client_updated ON public.trade_customers(client_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_jobs_client_status_updated ON public.trade_jobs(client_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_jobs_client_customer ON public.trade_jobs(client_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_job_items_client_kind_updated ON public.trade_job_items(client_id, kind, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_job_items_client_job ON public.trade_job_items(client_id, job_id);
