-- Excel-meet Database Schema - Enum Helpers
-- Location: supabase/migrations/20250115094530_enum_helpers.sql

-- Create a function to get enum values
CREATE OR REPLACE FUNCTION public.get_enum_values(enum_name TEXT)
RETURNS TEXT[] 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    enum_values TEXT[];
BEGIN
    EXECUTE format('SELECT array_agg(e.enumlabel) FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = %L', enum_name)
    INTO enum_values;
    
    RETURN enum_values;
END;
$$;

-- Create RLS policy for the function
GRANT EXECUTE ON FUNCTION public.get_enum_values TO authenticated, anon;

-- Create a function to get Nigerian cities by state
CREATE OR REPLACE FUNCTION public.get_nigerian_cities(state_name TEXT)
RETURNS TABLE(city TEXT) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- This is a simplified implementation
    -- In a real application, you would have a cities table with proper relationships
    
    -- For Lagos
    IF state_name = 'Lagos' THEN
        RETURN QUERY SELECT unnest(ARRAY[
            'Ikeja', 'Lagos Island', 'Victoria Island', 'Lekki', 'Ajah', 
            'Ikorodu', 'Epe', 'Badagry', 'Apapa', 'Surulere', 'Yaba',
            'Gbagada', 'Ilupeju', 'Mushin', 'Oshodi', 'Isolo', 'Agege',
            'Alimosho', 'Amuwo-Odofin', 'Festac', 'Ojo'
        ]::TEXT) AS city;
    
    -- For Abuja (FCT)
    ELSIF state_name = 'FCT' THEN
        RETURN QUERY SELECT unnest(ARRAY[
            'Abuja Municipal', 'Gwagwalada', 'Kuje', 'Bwari', 'Kwali', 'Abaji'
        ]::TEXT) AS city;
    
    -- For Rivers
    ELSIF state_name = 'Rivers' THEN
        RETURN QUERY SELECT unnest(ARRAY[
            'Port Harcourt', 'Obio-Akpor', 'Eleme', 'Oyigbo', 'Ikwerre', 'Etche',
            'Tai', 'Okrika', 'Bonny', 'Degema', 'Ahoada'
        ]::TEXT) AS city;
    
    -- For Kano
    ELSIF state_name = 'Kano' THEN
        RETURN QUERY SELECT unnest(ARRAY[
            'Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nassarawa',
            'Kumbotso', 'Ungogo', 'Dawakin Tofa', 'Tofa', 'Rimin Gado'
        ]::TEXT) AS city;
    
    -- For other states, return a default "Not Available" option
    -- In a real application, you would have complete data for all states
    ELSE
        RETURN QUERY SELECT 'Major Cities Not Available'::TEXT AS city;
    END IF;
END;
$$;

-- Create RLS policy for the cities function
GRANT EXECUTE ON FUNCTION public.get_nigerian_cities TO authenticated, anon;