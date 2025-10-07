-- Excel-meet Database Schema - Nigeria Localization
-- Location: supabase/migrations/20250115093045_nigeria_localization.sql

-- 1. Add Nigerian states enum
CREATE TYPE public.nigerian_state AS ENUM (
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 
    'Yobe', 'Zamfara'
);

-- 2. Add Nigerian currency and payment types
CREATE TYPE public.payment_currency AS ENUM ('NGN', 'USD', 'EUR', 'GBP');
CREATE TYPE public.nigerian_payment_method AS ENUM (
    'bank_transfer', 'card', 'ussd', 'paystack', 'flutterwave', 'cash', 'wallet'
);

-- 3. Update subscription_plan to include Nigerian pricing tiers
ALTER TYPE public.subscription_plan RENAME TO subscription_plan_old;
CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro', 'elite', 'naira_basic', 'naira_pro', 'naira_elite');

-- 4. Create Nigerian pricing table
CREATE TABLE public.nigeria_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type public.subscription_plan NOT NULL,
    amount_ngn INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add RLS to pricing table
ALTER TABLE public.nigeria_pricing ENABLE ROW LEVEL SECURITY;

-- 6. Create pricing policies
CREATE POLICY "anyone can view pricing"
ON public.nigeria_pricing
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "only admins can modify pricing"
ON public.nigeria_pricing
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. Add Nigerian-specific fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN state public.nigerian_state,
ADD COLUMN city TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN nin_verified BOOLEAN DEFAULT false,
ADD COLUMN bvn_verified BOOLEAN DEFAULT false,
ADD COLUMN preferred_currency public.payment_currency DEFAULT 'NGN'::public.payment_currency,
ADD COLUMN nigerian_qualifications JSONB DEFAULT '[]'::jsonb;

-- 8. Create Nigerian verification table
CREATE TABLE public.nigeria_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL,
    verification_id TEXT,
    verification_data JSONB,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Add RLS to verification table
ALTER TABLE public.nigeria_verification ENABLE ROW LEVEL SECURITY;

-- 10. Create verification policies
CREATE POLICY "users can view own verification"
ON public.nigeria_verification
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users can insert own verification"
ON public.nigeria_verification
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins can manage all verifications"
ON public.nigeria_verification
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 11. Create payment history table with Naira support
CREATE TABLE public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency public.payment_currency NOT NULL,
    payment_method public.nigerian_payment_method,
    payment_reference TEXT,
    payment_status TEXT NOT NULL,
    payment_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Add RLS to payment history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 13. Create payment history policies
CREATE POLICY "users can view own payments"
ON public.payment_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins can view all payments"
ON public.payment_history
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 14. Create trigger for updated_at on new tables
CREATE TRIGGER update_nigeria_pricing_updated_at
    BEFORE UPDATE ON public.nigeria_pricing
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nigeria_verification_updated_at
    BEFORE UPDATE ON public.nigeria_verification
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON public.payment_history
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Insert initial Nigerian pricing data
INSERT INTO public.nigeria_pricing (plan_type, amount_ngn, duration_days, features) VALUES
('naira_basic', 5000, 30, '{"job_posts": 5, "profile_views": 50, "featured_days": 0, "message_limit": 20}'::jsonb),
('naira_pro', 15000, 30, '{"job_posts": 20, "profile_views": 200, "featured_days": 5, "message_limit": 100}'::jsonb),
('naira_elite', 30000, 30, '{"job_posts": 50, "profile_views": 500, "featured_days": 15, "message_limit": "unlimited"}'::jsonb);

-- 16. Create function to convert old subscription plans to new ones
CREATE OR REPLACE FUNCTION public.migrate_subscription_plans()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update existing users with old subscription plans to new ones
    UPDATE public.user_profiles
    SET subscription_plan = 
        CASE 
            WHEN subscription_plan::text = 'basic' THEN 'naira_basic'::public.subscription_plan
            WHEN subscription_plan::text = 'pro' THEN 'naira_pro'::public.subscription_plan
            WHEN subscription_plan::text = 'elite' THEN 'naira_elite'::public.subscription_plan
            ELSE subscription_plan
        END
    WHERE preferred_currency = 'NGN'::public.payment_currency;
END;
$$;

-- 17. Create function to format currency based on user preference
CREATE OR REPLACE FUNCTION public.format_currency(amount DECIMAL, currency public.payment_currency DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_currency public.payment_currency;
BEGIN
    -- If currency is not provided, get user's preferred currency
    IF currency IS NULL THEN
        SELECT preferred_currency INTO user_currency
        FROM public.user_profiles
        WHERE id = auth.uid();
        
        IF user_currency IS NULL THEN
            user_currency := 'NGN'::public.payment_currency;
        END IF;
    ELSE
        user_currency := currency;
    END IF;
    
    -- Format based on currency
    RETURN CASE
        WHEN user_currency = 'NGN' THEN '₦' || amount::TEXT
        WHEN user_currency = 'USD' THEN '$' || amount::TEXT
        WHEN user_currency = 'EUR' THEN '€' || amount::TEXT
        WHEN user_currency = 'GBP' THEN '£' || amount::TEXT
        ELSE amount::TEXT
    END;
END;
$$;

-- 18. Run the migration function
SELECT public.migrate_subscription_plans();