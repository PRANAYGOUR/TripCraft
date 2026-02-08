-- ============================================
-- SUPABASE DATABASE FIX
-- ============================================
-- PROBLEM: Created public.users which conflicts with auth.users
-- SOLUTION: Use public.profiles for app-specific data + auth trigger
-- ============================================

-- STEP 1: DROP INVALID TABLE (safe removal)
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.hotels CASCADE;

-- STEP 2: CREATE PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: CREATE HOTELS TABLE (reference data - no changes)
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(3,1) NOT NULL,
  price_per_night INTEGER NOT NULL,
  amenities TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: CREATE TRIPS TABLE (NOW references profiles, not users)
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'recommended', 'accepted', 'rejected')),
  budget INTEGER NOT NULL,
  travelers INTEGER NOT NULL,
  dietary_restrictions TEXT[] DEFAULT '{}',
  travel_style TEXT NOT NULL,
  accommodation_preferences TEXT[] DEFAULT '{}',
  form_data JSONB,
  recommended_hotels JSONB DEFAULT NULL,
  approved_hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_trips_customer_id ON public.trips(customer_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_approved_hotel_id ON public.trips(approved_hotel_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- STEP 6: ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- STEP 7: RLS POLICIES FOR PROFILES
-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (allows client-side upsert/insert when authenticated)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles (for role assignment)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STEP 8: RLS POLICIES FOR HOTELS
-- Hotels are readable by everyone
DROP POLICY IF EXISTS "Hotels are readable by everyone" ON public.hotels;
CREATE POLICY "Hotels are readable by everyone"
  ON public.hotels
  FOR SELECT
  USING (true);

-- STEP 9: RLS POLICIES FOR TRIPS
-- Customers can read their own trips
DROP POLICY IF EXISTS "Customers can read own trips" ON public.trips;
CREATE POLICY "Customers can read own trips"
  ON public.trips
  FOR SELECT
  USING (customer_id = auth.uid());

-- Customers can create trips
DROP POLICY IF EXISTS "Customers can create trips" ON public.trips;
CREATE POLICY "Customers can create trips"
  ON public.trips
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Customers can update their own trips
DROP POLICY IF EXISTS "Customers can update own trips" ON public.trips;
CREATE POLICY "Customers can update own trips"
  ON public.trips
  FOR UPDATE
  USING (customer_id = auth.uid());

-- Admins can read all trips
DROP POLICY IF EXISTS "Admins can read all trips" ON public.trips;
CREATE POLICY "Admins can read all trips"
  ON public.trips
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all trips (approve/reject)
DROP POLICY IF EXISTS "Admins can update all trips" ON public.trips;
CREATE POLICY "Admins can update all trips"
  ON public.trips
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STEP 10: CREATE AUTH TRIGGER
-- This function automatically creates a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 11: INSERT DEMO HOTELS
INSERT INTO public.hotels (name, location, rating, price_per_night, amenities, image_url) VALUES
('Luxury Resort & Spa', 'Bali, Indonesia', 4.8, 250, ARRAY['Pool', 'Spa', 'Restaurant', 'WiFi', 'AC'], 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'),
('Beach Escape Bungalow', 'Bali, Indonesia', 4.5, 120, ARRAY['Beach', 'WiFi', 'Kitchen', 'Garden'], 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'),
('Mountain Lodge', 'Himalayas, India', 4.3, 80, ARRAY['Hiking', 'Bonfire', 'Organic Food', 'WiFi'], 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'),
('City Central Hotel', 'Tokyo, Japan', 4.7, 200, ARRAY['Business Center', 'Restaurant', 'Gym', 'WiFi', 'AC'], 'https://images.unsplash.com/photo-1554866585-f50d0aa1b50b?w=400'),
('Tropical Paradise', 'Maldives', 5.0, 350, ARRAY['Over-water Bungalow', 'Snorkeling', 'Private Beach', 'Spa'], 'https://images.unsplash.com/photo-1542314503-37ab8cb33b6b?w=400'),
('Budget Hostel', 'Bangkok, Thailand', 4.0, 30, ARRAY['Shared Kitchen', 'WiFi', 'Social Area'], 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'),
('Swiss Alps Chalet', 'Swiss Alps', 4.6, 280, ARRAY['Mountain View', 'Fireplace', 'Restaurant', 'Ski Access'], 'https://images.unsplash.com/photo-1518066000714-58c45f1b773c?w=400'),
('Desert Safari Camp', 'Rajasthan, India', 4.4, 150, ARRAY['Desert Tour', 'Camel Ride', 'Bonfire', 'Traditional Food'], 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'),
('Island Resort', 'Fiji', 4.9, 320, ARRAY['Private Island', 'Water Sports', 'Dive Center', 'Beachfront'], 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'),
('Urban Boutique', 'Paris, France', 4.5, 180, ARRAY['WiFi', 'Restaurant', 'Concierge', 'AC'], 'https://images.unsplash.com/photo-1595436052695-01e4dfc444b7?w=400')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES (run these after setup)
-- ============================================
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.hotels LIMIT 3;
-- SELECT * FROM public.trips;
