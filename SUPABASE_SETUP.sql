-- =================================================================
-- SUPABASE DATABASE SCHEMA
-- Trip Planner Application
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 1. USERS TABLE
-- =================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =================================================================
-- 2. HOTELS TABLE
-- =================================================================
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  location_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_rooms INTEGER NOT NULL,
  room_types JSONB NOT NULL DEFAULT '{
    "single": 0,
    "double": 0,
    "triple": 0,
    "quad": 0
  }'::JSONB,
  event_hall_available BOOLEAN DEFAULT FALSE,
  hall_capacity INTEGER,
  audio_visual_equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
  meal_options TEXT[] DEFAULT ARRAY[]::TEXT[],
  price_range TEXT NOT NULL DEFAULT 'moderate' CHECK (price_range IN ('budget', 'moderate', 'luxury')),
  image_url TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  price_per_night NUMERIC,
  rating NUMERIC(2,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast hotel lookups
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_star_rating ON hotels(star_rating);
CREATE INDEX idx_hotels_price_range ON hotels(price_range);

-- =================================================================
-- 3. TRIPS TABLE
-- =================================================================
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'recommended', 'accepted', 'rejected')),
  form_data JSONB NOT NULL,
  system_recommendations JSONB NOT NULL DEFAULT '[]'::JSONB,
  approved_hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast trip lookups
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_created_at ON trips(created_at DESC);

-- =================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- === USERS TABLE RLS ===
-- Admin can see all users, customers can see only themselves
CREATE POLICY users_select ON users
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      get_current_user_role() = 'admin' OR
      id::TEXT = current_user_id()
    )
  );

-- === HOTELS TABLE RLS ===
-- Everyone can see all hotels (no filtering needed)
CREATE POLICY hotels_select ON hotels
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- === TRIPS TABLE RLS ===
-- Customers can see only their own trips
-- Admins can see all trips
CREATE POLICY trips_select ON trips
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      get_current_user_role() = 'admin' OR
      user_id = get_current_user_id()
    )
  );

-- Customers can insert their own trips
CREATE POLICY trips_insert ON trips
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = get_current_user_id()
  );

-- Both customers and admins can update (but logic enforced in app)
CREATE POLICY trips_update ON trips
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      get_current_user_role() = 'admin' OR
      user_id = get_current_user_id()
    )
  );

-- =================================================================
-- 5. HELPER FUNCTIONS (to work with localStorage tokens)
-- =================================================================

-- Get current user ID from JWT or app session
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role')::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Helper to get current user ID from text
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 6. SEED DATA (Sample Hotels)
-- Run this after tables are created
-- =================================================================

-- Insert sample hotels
INSERT INTO hotels (name, location, city, star_rating, amenities, location_type, total_rooms, room_types, event_hall_available, hall_capacity, meal_options, price_range, image_url, images, description, price_per_night, rating) VALUES
('Luxury Beach Resort', 'Beachfront Road', 'Goa', 5, ARRAY['Pool', 'Spa', 'Gym', 'WiFi'], ARRAY['beach', 'resort'], 100, '{"single": 20, "double": 40, "triple": 20, "quad": 20}', true, 500, ARRAY['Breakfast', 'Lunch', 'Dinner'], 'luxury', 'https://via.placeholder.com/800x450?text=Luxury+Beach+Resort', ARRAY['https://via.placeholder.com/800x450?text=Luxury+Beach+Resort', 'https://via.placeholder.com/800x450?text=Beach+Pool', 'https://via.placeholder.com/800x450?text=Beach+Spa'], 'Premium beach resort with world-class amenities and stunning ocean views.', 350, 4.8),
('City Business Hotel', 'Market Street', 'Mumbai', 4, ARRAY['Conference Room', 'Gym', 'WiFi', 'Restaurant'], ARRAY['city', 'business'], 80, '{"single": 30, "double": 30, "triple": 15, "quad": 5}', true, 300, ARRAY['Breakfast', 'Lunch', 'Dinner'], 'moderate', 'https://via.placeholder.com/800x450?text=City+Business+Hotel', ARRAY['https://via.placeholder.com/800x450?text=Business+Hotel', 'https://via.placeholder.com/800x450?text=Conference+Room', 'https://via.placeholder.com/800x450?text=Business+Lobby'], 'Modern business hotel in the heart of the city with excellent meeting facilities.', 200, 4.5),
('Budget Inn', 'Station Road', 'Delhi', 2, ARRAY['WiFi', 'Restaurant'], ARRAY['city'], 50, '{"single": 25, "double": 20, "triple": 5, "quad": 0}', false, 0, ARRAY['Breakfast'], 'budget', 'https://via.placeholder.com/800x450?text=Budget+Inn', ARRAY['https://via.placeholder.com/800x450?text=Budget+Inn', 'https://via.placeholder.com/800x450?text=Budget+Room'], 'Affordable and comfortable budget accommodation near city center.', 80, 3.5),
('Nature Retreat Resort', 'Forest Road', 'Himachal Pradesh', 4, ARRAY['Hiking', 'Bonfire', 'Spa', 'WiFi'], ARRAY['nature'], 60, '{"single": 10, "double": 30, "triple": 15, "quad": 5}', false, 0, ARRAY['Breakfast', 'Lunch', 'Dinner'], 'moderate', 'https://via.placeholder.com/800x450?text=Nature+Retreat', ARRAY['https://via.placeholder.com/800x450?text=Nature+Resort', 'https://via.placeholder.com/800x450?text=Forest+Lodge', 'https://via.placeholder.com/800x450?text=Mountain+View'], 'Peaceful mountain retreat perfect for nature lovers and adventure seekers.', 180, 4.6),
('Palace Hotel', 'Heritage Lane', 'Jaipur', 5, ARRAY['Spa', 'Restaurant', 'Conference Hall', 'WiFi'], ARRAY['city'], 120, '{"single": 20, "double": 60, "triple": 30, "quad": 10}', true, 600, ARRAY['Breakfast', 'Lunch', 'Dinner'], 'luxury', 'https://via.placeholder.com/800x450?text=Palace+Hotel', ARRAY['https://via.placeholder.com/800x450?text=Palace+Exterior', 'https://via.placeholder.com/800x450?text=Palace+Ballroom', 'https://via.placeholder.com/800x450?text=Palace+Room'], 'Historic palace hotel with royal ambiance and world-class hospitality.', 280, 4.9),
('Beach House', 'Coastal Highway', 'Kerala', 3, ARRAY['Beach Access', 'Restaurant', 'WiFi'], ARRAY['beach', 'nature'], 70, '{"single": 20, "double": 35, "triple": 10, "quad": 5}', true, 200, ARRAY['Breakfast', 'Lunch', 'Dinner'], 'moderate', 'https://via.placeholder.com/800x450?text=Beach+House', ARRAY['https://via.placeholder.com/800x450?text=Coastal+Beach', 'https://via.placeholder.com/800x450?text=Beach+House+Room', 'https://via.placeholder.com/800x450?text=Sunset+View'], 'Charming beachfront property with direct access to pristine beaches.', 150, 4.3),
('Corporate Hub', 'Business Park', 'Bangalore', 4, ARRAY['Co-working Space', 'Gym', 'Restaurant', 'WiFi'], ARRAY['city', 'business'], 90, '{"single": 40, "double": 35, "triple": 10, "quad": 5}', true, 250, ARRAY['Breakfast', 'Lunch', 'Dinner'], 'moderate', 'https://via.placeholder.com/800x450?text=Corporate+Hub', ARRAY['https://via.placeholder.com/800x450?text=Corporate+Office', 'https://via.placeholder.com/800x450?text=Working+Space', 'https://via.placeholder.com/800x450?text=Corporate+Lounge'], 'Modern corporate facility ideal for business travelers and conference groups.', 160, 4.4),
('Mountain Lodge', 'Hill Station Road', 'Uttarakhand', 3, ARRAY['Bonfire', 'Trekking', 'WiFi'], ARRAY['nature'], 50, '{"single": 15, "double": 25, "triple": 8, "quad": 2}', false, 0, ARRAY['Breakfast', 'Lunch'], 'budget', 'https://via.placeholder.com/800x450?text=Mountain+Lodge', ARRAY['https://via.placeholder.com/800x450?text=Mountain+Lodge', 'https://via.placeholder.com/800x450?text=Lodge+Room', 'https://via.placeholder.com/800x450?text=Mountain+View'], 'Cozy mountain lodge surrounded by scenic beauty and adventure opportunities.', 120, 4.2),
('Royal Palace Resort', 'Royal Avenue', 'Udaipur', 5, ARRAY['Lake View', 'Spa', 'Restaurant', 'Conference'], ARRAY['resort', 'nature'], 150, '{"single": 25, "double": 75, "triple": 35, "quad": 15}', true, 800, ARRAY['Breakfast', 'Lunch', 'Dinner'], 'luxury', 'https://via.placeholder.com/800x450?text=Royal+Palace', ARRAY['https://via.placeholder.com/800x450?text=Palace+Lake+View', 'https://via.placeholder.com/800x450?text=Royal+Suite', 'https://via.placeholder.com/800x450?text=Palace+Gardens'], 'Extravagant palace resort overlooking the mesmerizing lake with lavish accommodations.', 400, 4.9),
('Express Inn', 'Highway Junction', 'Pune', 2, ARRAY['WiFi', 'Restaurant', '24hr Checkin'], ARRAY['city', 'business'], 60, '{"single": 30, "double": 20, "triple": 8, "quad": 2}', false, 0, ARRAY['Breakfast'], 'budget', 'https://via.placeholder.com/800x450?text=Express+Inn', ARRAY['https://via.placeholder.com/800x450?text=Express+Inn', 'https://via.placeholder.com/800x450?text=Express+Room'], 'Quick and convenient stopover option with essential amenities.', 100, 3.8);

-- Insert sample users (optional - for testing)
INSERT INTO users (email, name, role) VALUES
('customer@example.com', 'Demo Customer', 'customer'),
('admin@micetravel.com', 'Demo Admin', 'admin'),
('john@travel.com', 'John Doe', 'customer'),
('sarah.admin@micetravel.com', 'Sarah Manager', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =================================================================
-- QUERIES FOR TESTING
-- =================================================================

-- Get all pending trips (admin view)
-- SELECT * FROM trips WHERE status = 'pending';

-- Get customer's trips
-- SELECT * FROM trips WHERE user_id = '...' ORDER BY created_at DESC;

-- Get hotel recommendations for a city
-- SELECT * FROM hotels WHERE city = 'Goa' AND star_rating >= 4;

-- Get all 5-star hotels
-- SELECT * FROM hotels WHERE star_rating = 5;
