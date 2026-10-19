-- ============================================================
-- SELF-SERVE TRIALS, SUBSCRIPTION BILLING & ACCOUNT METADATA
-- Run after 20260610_add_billing_analytics.sql
-- ============================================================

-- 1. Account metadata captured during self-serve signup
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS trade TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'provisioned',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- The commercial catalogue starts at Operator; older rows keep their value.
ALTER TABLE public.clients ALTER COLUMN plan_tier SET DEFAULT 'operator';

-- 2. Billing event ledger — makes Stripe webhook handling idempotent
CREATE TABLE IF NOT EXISTS public.billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service role can read or write this table.

-- 3. Lookup indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_trial_ends ON public.clients(trial_ends_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_stripe_customer
  ON public.clients(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_stripe_subscription
  ON public.clients(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- 4. Keep account status honest for expired trials.
--    A nightly job or cron endpoint can call this helper:
--      SELECT public.expire_finished_trials();
CREATE OR REPLACE FUNCTION public.expire_finished_trials()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed integer;
BEGIN
  UPDATE public.clients
     SET status = 'suspended'
   WHERE status = 'trialing'
     AND trial_ends_at IS NOT NULL
     AND trial_ends_at < now() - interval '3 days'
     AND payment_status <> 'paid';
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed;
END;
$$;
