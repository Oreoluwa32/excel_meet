-- Add subscription management columns to user_profiles
-- Location: supabase/migrations/20250129000000_add_subscription_management.sql

-- 1. Add subscription management columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT;

-- 2. Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON public.user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_paystack_code ON public.user_profiles(paystack_subscription_code);

-- 3. Migrate existing subscription_plan data to subscription_tier
UPDATE public.user_profiles
SET subscription_tier = subscription_plan::TEXT
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

-- 4. Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_method TEXT NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  payment_status TEXT NOT NULL,
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_reference ON public.payment_history(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- 6. Enable RLS on payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for payment_history
DROP POLICY IF EXISTS "users_can_view_own_payment_history" ON public.payment_history;
CREATE POLICY "users_can_view_own_payment_history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_can_insert_own_payment_history" ON public.payment_history;
CREATE POLICY "users_can_insert_own_payment_history"
ON public.payment_history
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_can_manage_all_payment_history" ON public.payment_history;
CREATE POLICY "admins_can_manage_all_payment_history"
ON public.payment_history
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. Create trigger for payment_history updated_at
DROP TRIGGER IF EXISTS update_payment_history_updated_at ON public.payment_history;
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON public.payment_history
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Create function to check subscription status
CREATE OR REPLACE FUNCTION public.check_subscription_status(user_uuid UUID)
RETURNS TABLE (
  is_active BOOLEAN,
  tier TEXT,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN up.subscription_end_date IS NULL THEN FALSE
      WHEN up.subscription_end_date > NOW() THEN TRUE
      ELSE FALSE
    END as is_active,
    up.subscription_tier as tier,
    CASE 
      WHEN up.subscription_end_date IS NULL THEN 0
      ELSE EXTRACT(DAY FROM (up.subscription_end_date - NOW()))::INTEGER
    END as days_remaining
  FROM public.user_profiles up
  WHERE up.id = user_uuid;
END;
$$;

-- 10. Create function to get user payment history
CREATE OR REPLACE FUNCTION public.get_user_payment_history(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  amount DECIMAL(10, 2),
  currency TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  payment_status TEXT,
  payment_data JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.id,
    ph.amount,
    ph.currency,
    ph.payment_method,
    ph.payment_reference,
    ph.payment_status,
    ph.payment_data,
    ph.created_at
  FROM public.payment_history ph
  WHERE ph.user_id = user_uuid
  ORDER BY ph.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 11. Create function to update subscription status automatically
CREATE OR REPLACE FUNCTION public.update_expired_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.user_profiles
  SET 
    subscription_status = 'expired',
    subscription_tier = 'free'
  WHERE 
    subscription_end_date < NOW()
    AND subscription_status = 'active';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- 12. Add comment to tables
COMMENT ON TABLE public.payment_history IS 'Stores payment transaction history for subscriptions and other payments';
COMMENT ON COLUMN public.user_profiles.subscription_tier IS 'Current subscription tier: free, basic, pro, elite';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Subscription status: active, cancelled, expired, pending';
COMMENT ON COLUMN public.user_profiles.paystack_subscription_code IS 'Paystack subscription code for managing recurring payments';