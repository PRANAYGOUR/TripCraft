-- =================================================================
-- MIGRATION: Add image and pricing fields to hotels table
-- Run this SQL in Supabase SQL Editor
-- =================================================================

-- Add missing columns to hotels table
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS price_per_night NUMERIC,
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1);

-- Update existing hotels with sample image URLs and pricing data
UPDATE hotels SET 
  image_url = 'https://via.placeholder.com/800x450?text=' || name,
  images = ARRAY['https://via.placeholder.com/800x450?text=' || name, 'https://via.placeholder.com/800x450?text=' || name || '+View'],
  description = 'Premium accommodation with excellent amenities and services.',
  price_per_night = 200,
  rating = 4.5
WHERE image_url IS NULL;

-- Add specific details for each hotel
UPDATE hotels SET 
  price_per_night = 350,
  rating = 4.8,
  description = 'Premium beach resort with world-class amenities and stunning ocean views.',
  image_url = 'https://via.placeholder.com/800x450?text=Luxury+Beach+Resort',
  images = ARRAY['https://via.placeholder.com/800x450?text=Beach+Resort', 'https://via.placeholder.com/800x450?text=Beach+Pool', 'https://via.placeholder.com/800x450?text=Beach+Spa']
WHERE name = 'Luxury Beach Resort';

UPDATE hotels SET 
  price_per_night = 200,
  rating = 4.5,
  description = 'Modern business hotel in the heart of the city with excellent meeting facilities.',
  image_url = 'https://via.placeholder.com/800x450?text=Business+Hotel',
  images = ARRAY['https://via.placeholder.com/800x450?text=Business+Hotel', 'https://via.placeholder.com/800x450?text=Conference+Room', 'https://via.placeholder.com/800x450?text=Business+Lobby']
WHERE name = 'City Business Hotel';

UPDATE hotels SET 
  price_per_night = 80,
  rating = 3.5,
  description = 'Affordable and comfortable budget accommodation near city center.',
  image_url = 'https://via.placeholder.com/800x450?text=Budget+Inn',
  images = ARRAY['https://via.placeholder.com/800x450?text=Budget+Inn', 'https://via.placeholder.com/800x450?text=Budget+Room']
WHERE name = 'Budget Inn';

UPDATE hotels SET 
  price_per_night = 180,
  rating = 4.6,
  description = 'Peaceful mountain retreat perfect for nature lovers and adventure seekers.',
  image_url = 'https://via.placeholder.com/800x450?text=Nature+Retreat',
  images = ARRAY['https://via.placeholder.com/800x450?text=Nature+Resort', 'https://via.placeholder.com/800x450?text=Forest+Lodge', 'https://via.placeholder.com/800x450?text=Mountain+View']
WHERE name = 'Nature Retreat Resort';

UPDATE hotels SET 
  price_per_night = 280,
  rating = 4.9,
  description = 'Historic palace hotel with royal ambiance and world-class hospitality.',
  image_url = 'https://via.placeholder.com/800x450?text=Palace+Hotel',
  images = ARRAY['https://via.placeholder.com/800x450?text=Palace+Exterior', 'https://via.placeholder.com/800x450?text=Palace+Ballroom', 'https://via.placeholder.com/800x450?text=Palace+Room']
WHERE name = 'Palace Hotel';

UPDATE hotels SET 
  price_per_night = 150,
  rating = 4.3,
  description = 'Charming beachfront property with direct access to pristine beaches.',
  image_url = 'https://via.placeholder.com/800x450?text=Beach+House',
  images = ARRAY['https://via.placeholder.com/800x450?text=Coastal+Beach', 'https://via.placeholder.com/800x450?text=Beach+House+Room', 'https://via.placeholder.com/800x450?text=Sunset+View']
WHERE name = 'Beach House';

UPDATE hotels SET 
  price_per_night = 160,
  rating = 4.4,
  description = 'Modern corporate facility ideal for business travelers and conference groups.',
  image_url = 'https://via.placeholder.com/800x450?text=Corporate+Hub',
  images = ARRAY['https://via.placeholder.com/800x450?text=Corporate+Office', 'https://via.placeholder.com/800x450?text=Working+Space', 'https://via.placeholder.com/800x450?text=Corporate+Lounge']
WHERE name = 'Corporate Hub';

UPDATE hotels SET 
  price_per_night = 120,
  rating = 4.2,
  description = 'Cozy mountain lodge surrounded by scenic beauty and adventure opportunities.',
  image_url = 'https://via.placeholder.com/800x450?text=Mountain+Lodge',
  images = ARRAY['https://via.placeholder.com/800x450?text=Mountain+Lodge', 'https://via.placeholder.com/800x450?text=Lodge+Room', 'https://via.placeholder.com/800x450?text=Mountain+View']
WHERE name = 'Mountain Lodge';

UPDATE hotels SET 
  price_per_night = 400,
  rating = 4.9,
  description = 'Extravagant palace resort overlooking the lake with lavish accommodations.',
  image_url = 'https://via.placeholder.com/800x450?text=Royal+Palace',
  images = ARRAY['https://via.placeholder.com/800x450?text=Palace+Lake+View', 'https://via.placeholder.com/800x450?text=Royal+Suite', 'https://via.placeholder.com/800x450?text=Palace+Gardens']
WHERE name = 'Royal Palace Resort';

UPDATE hotels SET 
  price_per_night = 100,
  rating = 3.8,
  description = 'Quick and convenient stopover option with essential amenities.',
  image_url = 'https://via.placeholder.com/800x450?text=Express+Inn',
  images = ARRAY['https://via.placeholder.com/800x450?text=Express+Inn', 'https://via.placeholder.com/800x450?text=Express+Room']
WHERE name = 'Express Inn';

-- Verify the changes
-- SELECT id, name, image_url, images, price_per_night, rating FROM hotels;
