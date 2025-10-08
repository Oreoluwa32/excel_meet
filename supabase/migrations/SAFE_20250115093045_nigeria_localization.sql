-- Excel-meet Database Schema - Nigeria Localization (SAFE VERSION)
-- Location: supabase/migrations/SAFE_20250115093045_nigeria_localization.sql
-- This version can be run multiple times without errors

-- 1. Add Nigerian states enum (with duplicate protection)
DO $$ BEGIN
    CREATE TYPE public.nigerian_state AS ENUM (
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 
        'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
        'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 
        'Yobe', 'Zamfara'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Nigerian currency and payment types (with duplicate protection)
DO $$ BEGIN
    CREATE TYPE public.payment_currency AS ENUM ('NGN', 'USD', 'EUR', 'GBP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.nigerian_payment_method AS ENUM (
        'bank_transfer', 'card', 'ussd', 'paystack', 'flutterwave', 'cash', 'wallet'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Update subscription_plan to include Nigerian pricing tiers
-- This is the FIXED version that handles the enum migration properly
DO $$ 
BEGIN
    -- Check if the new subscription_plan type already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'subscription_plan' 
        AND typtype = 'e'
        AND 'naira_basic' = ANY(enum_range(NULL::public.subscription_plan)::text[])
    ) THEN
        -- Only do the migration if we haven't already
        
        -- Step 1: Add a temporary column with text type
        ALTER TABLE public.user_profiles 
        ADD COLUMN IF NOT EXISTS subscription_plan_temp TEXT;
        
        -- Step 2: Copy current values to temp column
        UPDATE public.user_profiles 
        SET subscription_plan_temp = subscription_plan::text;
        
        -- Step 3: Drop the old column (this will drop the constraint)
        ALTER TABLE public.user_profiles 
        DROP COLUMN IF EXISTS subscription_plan;
        
        -- Step 4: Rename old type if it exists
        ALTER TYPE public.subscription_plan RENAME TO subscription_plan_old;
        
        -- Step 5: Create new type with all values
        CREATE TYPE public.subscription_plan AS ENUM (
            'free', 'basic', 'pro', 'elite', 'naira_basic', 'naira_pro', 'naira_elite'
        );
        
        -- Step 6: Add the column back with new type
        ALTER TABLE public.user_profiles 
        ADD COLUMN subscription_plan public.subscription_plan DEFAULT 'free'::public.subscription_plan;
        
        -- Step 7: Migrate data from temp column to new column
        UPDATE public.user_profiles 
        SET subscription_plan = subscription_plan_temp::public.subscription_plan
        WHERE subscription_plan_temp IS NOT NULL;
        
        -- Step 8: Drop temp column
        ALTER TABLE public.user_profiles 
        DROP COLUMN subscription_plan_temp;
        
        -- Step 9: Drop old type
        DROP TYPE IF EXISTS public.subscription_plan_old;
    END IF;
END $$;

-- 4. Create Nigerian pricing table
CREATE TABLE IF NOT EXISTS public.nigeria_pricing (
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

-- 6. Create pricing policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "anyone can view pricing" ON public.nigeria_pricing;
CREATE POLICY "anyone can view pricing"
ON public.nigeria_pricing
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "only admins can modify pricing" ON public.nigeria_pricing;
CREATE POLICY "only admins can modify pricing"
ON public.nigeria_pricing
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. Add Nigerian-specific fields to user_profiles (with duplicate protection)
DO $$ 
BEGIN
    -- Add state column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'state'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN state public.nigerian_state;
    END IF;
    
    -- Add city column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN city TEXT;
    END IF;
    
    -- Add postal_code column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'postal_code'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN postal_code TEXT;
    END IF;
    
    -- Add nin_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'nin_verified'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN nin_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Add bvn_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'bvn_verified'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN bvn_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Add preferred_currency column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'preferred_currency'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN preferred_currency public.payment_currency DEFAULT 'NGN'::public.payment_currency;
    END IF;
    
    -- Add nigerian_qualifications column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'nigerian_qualifications'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN nigerian_qualifications JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 8. Create Nigerian verification table
CREATE TABLE IF NOT EXISTS public.nigeria_verification (
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

-- 10. Create verification policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "users can view own verification" ON public.nigeria_verification;
CREATE POLICY "users can view own verification"
ON public.nigeria_verification
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users can insert own verification" ON public.nigeria_verification;
CREATE POLICY "users can insert own verification"
ON public.nigeria_verification
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins can manage all verifications" ON public.nigeria_verification;
CREATE POLICY "admins can manage all verifications"
ON public.nigeria_verification
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 11. Create payment history table with Naira support
CREATE TABLE IF NOT EXISTS public.payment_history (
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

-- 13. Create payment history policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "users can view own payments" ON public.payment_history;
CREATE POLICY "users can view own payments"
ON public.payment_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins can view all payments" ON public.payment_history;
CREATE POLICY "admins can view all payments"
ON public.payment_history
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 14. Create trigger for updated_at on new tables (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_nigeria_pricing_updated_at ON public.nigeria_pricing;
CREATE TRIGGER update_nigeria_pricing_updated_at
    BEFORE UPDATE ON public.nigeria_pricing
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_nigeria_verification_updated_at ON public.nigeria_verification;
CREATE TRIGGER update_nigeria_verification_updated_at
    BEFORE UPDATE ON public.nigeria_verification
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_history_updated_at ON public.payment_history;
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON public.payment_history
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Insert initial Nigerian pricing data (check for duplicates first)
INSERT INTO public.nigeria_pricing (plan_type, amount_ngn, duration_days, features)
SELECT 'naira_basic'::public.subscription_plan, 5000, 30, '{"job_posts": 5, "profile_views": 50, "featured_days": 0, "message_limit": 20}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.nigeria_pricing WHERE plan_type = 'naira_basic'::public.subscription_plan);

INSERT INTO public.nigeria_pricing (plan_type, amount_ngn, duration_days, features)
SELECT 'naira_pro'::public.subscription_plan, 15000, 30, '{"job_posts": 20, "profile_views": 200, "featured_days": 5, "message_limit": 100}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.nigeria_pricing WHERE plan_type = 'naira_pro'::public.subscription_plan);

INSERT INTO public.nigeria_pricing (plan_type, amount_ngn, duration_days, features)
SELECT 'naira_elite'::public.subscription_plan, 30000, 30, '{"job_posts": 50, "profile_views": 500, "featured_days": 15, "message_limit": "unlimited"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.nigeria_pricing WHERE plan_type = 'naira_elite'::public.subscription_plan);

-- 16. Create function to convert old subscription plans to new ones (FIXED VERSION)
CREATE OR REPLACE FUNCTION public.migrate_subscription_plans()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update existing users with old subscription plans to new ones
    -- This now works because we've properly migrated the enum type
    UPDATE public.user_profiles
    SET subscription_plan = 
        CASE subscription_plan::text
            WHEN 'basic' THEN 'naira_basic'::public.subscription_plan
            WHEN 'pro' THEN 'naira_pro'::public.subscription_plan
            WHEN 'elite' THEN 'naira_elite'::public.subscription_plan
            ELSE subscription_plan
        END
    WHERE preferred_currency = 'NGN'::public.payment_currency
    AND subscription_plan::text IN ('basic', 'pro', 'elite');
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

-- 18. Run the migration function (only if there are users to migrate)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE preferred_currency = 'NGN'::public.payment_currency
        AND subscription_plan::text IN ('basic', 'pro', 'elite')
    ) THEN
        PERFORM public.migrate_subscription_plans();
    END IF;
END $$;

-- Success notification
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Nigeria localization migration completed successfully!';
    RAISE NOTICE '📊 Created tables: nigeria_pricing, nigeria_verification, payment_history';
    RAISE NOTICE '🌍 Added Nigerian states, payment methods, and currency support';
    RAISE NOTICE '💰 Inserted pricing data for naira_basic, naira_pro, naira_elite plans';
END $$;