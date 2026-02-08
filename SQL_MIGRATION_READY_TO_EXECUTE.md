# 🗄️ DATABASE MIGRATION - SQL COMMANDS (Copy & Paste Ready)

## ⚠️ IMPORTANT - Follow These Steps Exactly:

### 1. Open Supabase SQL Editor
- Go to https://app.supabase.com
- Select your project
- Click "SQL Editor" on the left sidebar
- Click the "+ New Query" button

### 2. Copy ENTIRE Script Below
Everything between the dashed lines

### 3. Paste Into Query Box

### 4. Click "Run" Button

### 5. Wait for Success Message

---

## 📋 SQL SCRIPT - COPY EVERYTHING BELOW

```sql
-- ============================================
-- HOTEL IMAGES IMPLEMENTATION
-- Trip Planner Database Migration
-- ============================================
-- This migration adds support for 4-5 hotel images
-- per hotel, along with description and pricing
-- ============================================

-- STEP 1: Add images column
-- Stores array of 4-5 image URLs per hotel
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;

-- STEP 2: Add description column
-- Stores hotel description text
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS description TEXT;

-- STEP 3: Add price_per_night column
-- Stores nightly rate
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS price_per_night INTEGER;

-- STEP 4: Create index for performance
-- Makes queries faster
CREATE INDEX IF NOT EXISTS idx_hotels_created_at 
ON public.hotels(created_at DESC);

-- ============================================
-- OPTIONAL: Add Sample Data
-- ============================================
-- Uncomment below to populate ONE hotel with data
-- ============================================

-- UPDATE public.hotels 
-- SET 
--   images = jsonb_build_array(
--     'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
--     'https://images.unsplash.com/photo-1631049456028-3a7325c0eeb5?w=800',
--     'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
--     'https://images.unsplash.com/photo-1591825481567-db1554ae5dfc?w=800',
--     'https://images.unsplash.com/photo-1551632986-6e0dba5cda14?w=800'
--   ),
--   description = 'Beautiful luxury hotel with world-class amenities, stunning beachfront views, and exceptional service.',
--   price_per_night = 250
-- WHERE id IS NOT NULL LIMIT 1;
```

---

## ✅ VERIFICATION AFTER RUNNING

### Check 1: Verify Columns Added
Run this query to verify:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hotels' 
ORDER BY column_name;
```

You should see these new columns:
- ✅ `images` (JSONB)
- ✅ `description` (TEXT)  
- ✅ `price_per_night` (INTEGER)

### Check 2: Verify Index Created
Run this query:

```sql
-- Check if index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'hotels' 
AND indexname = 'idx_hotels_created_at';
```

You should see one result confirming the index exists.

---

## 🚀 NEXT: ADD DATA TO HOTELS

Once migration is confirmed, add images to your hotels:

### Option A: Update All Hotels (Using Placeholder URLs)
```sql
UPDATE public.hotels 
SET 
  images = jsonb_build_array(
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1631049456028-3a7325c0eeb5?w=800',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
    'https://images.unsplash.com/photo-1591825481567-db1554ae5dfc?w=800',
    'https://images.unsplash.com/photo-1551632986-6e0dba5cda14?w=800'
  ),
  description = COALESCE(description, 'Luxury hotel with world-class amenities'),
  price_per_night = COALESCE(price_per_night, 150)
WHERE id IS NOT NULL;
```

### Option B: Update Specific Hotel by Name
```sql
UPDATE public.hotels 
SET 
  images = jsonb_build_array(
    'https://your-image-url-1.jpg',
    'https://your-image-url-2.jpg',
    'https://your-image-url-3.jpg',
    'https://your-image-url-4.jpg',
    'https://your-image-url-5.jpg'
  ),
  description = 'Your hotel description here',
  price_per_night = 200
WHERE name = 'Your Hotel Name';
```

### Option C: Update Using Table Editor (GUI)
1. Go to "Table Editor" in Supabase
2. Click on "hotels" table
3. Scroll right to see new columns
4. Click on a cell in "images" column
5. Paste JSON array like: `["url1","url2","url3","url4","url5"]`
6. Update "description" and "price_per_night" similarly

---

## 📸 SAMPLE IMAGE URLS (Free Stock Photos)

### Unsplash URLs (Always Free, No Attribution Needed)
```
Beach Hotel:
https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800
https://images.unsplash.com/photo-1631049456028-3a7325c0eeb5?w=800
https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800
https://images.unsplash.com/photo-1591825481567-db1554ae5dfc?w=800
https://images.unsplash.com/photo-1551632986-6e0dba5cda14?w=800

Mountain Resort:
https://images.unsplash.com/photo-1559208033-d0c79d4fbf0a?w=800
https://images.unsplash.com/photo-1503181663575-1c59c3e54f3d?w=800
https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800
https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800
https://images.unsplash.com/photo-1571370565303-b377d5ef01aa?w=800

City Hotel:
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800
https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800
https://images.unsplash.com/photo-1488813394876-45596cbcbaed?w=800
https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800
https://images.unsplash.com/photo-1514027454177-42a894e3aeeb?w=800
```

### Copy Full Array (4-5 images):
```json
["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1631049456028-3a7325c0eeb5?w=800","https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800","https://images.unsplash.com/photo-1591825481567-db1554ae5dfc?w=800","https://images.unsplash.com/photo-1551632986-6e0dba5cda14?w=800"]
```

---

## 💾 COMPLETE DATA UPDATE EXAMPLE

Here's a complete example with everything:

```sql
-- Update Hotel #1
UPDATE public.hotels 
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1631049456028-3a7325c0eeb5?w=800',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
    'https://images.unsplash.com/photo-1591825481567-db1554ae5dfc?w=800',
    'https://images.unsplash.com/photo-1551632986-6e0dba5cda14?w=800'
  ]::text[],
  description = E'Gorgeous beachfront resort with pristine white sand, crystal clear waters, and luxury accommodations. Perfect for weddings and celebrations!',
  price_per_night = 280
WHERE name = 'Paradise Beach Resort';

-- Update Hotel #2
UPDATE public.hotels 
SET 
  images = ARRAY[
    'https://images.unsplash.com/photo-1559208033-d0c79d4fbf0a?w=800',
    'https://images.unsplash.com/photo-1503181663575-1c59c3e54f3d?w=800',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    'https://images.unsplash.com/photo-1571370565303-b377d5ef01aa?w=800'
  ]::text[],
  description = E'Majestic mountain retreat with breathtaking views, world-class dining, and premium facilities. Ideal for corporate retreats and family gatherings.',
  price_per_night = 350
WHERE name = 'Mountain Peak Hotel';
```

---

## 🔄 JSONB vs ARRAY Format

### JSONB Format (Recommended - What We Use)
```sql
images = jsonb_build_array('url1', 'url2', 'url3', 'url4', 'url5')
images = '["url1", "url2", "url3", "url4", "url5"]'::jsonb
```

### TEXT ARRAY Format (Alternative)
```sql
images = ARRAY['url1', 'url2', 'url3', 'url4', 'url5']::text[]
images = '{url1, url2, url3, url4, url5}'::text[]
```

---

## 🚨 COMMON ERRORS & FIXES

### Error 1: "Column already exists"
```
Message: ERROR: column "images" of relation "hotels" already exists
Fix: Remove the "IF NOT EXISTS" check, keep going to next command
OR: Migration was already run, your columns exist and are ready
```

### Error 2: "Syntax error"
```
Message: ERROR: syntax error at or near...
Fix: Make sure you copied ENTIRE script without modifications
Try running one command at a time instead of all together
```

### Error 3: "Table doesn't exist"
```
Message: ERROR: relation "public.hotels" does not exist
Fix: Make sure you have a hotels table
Check that table is in public schema
```

### Error 4: "Column data type mismatch"
```
Message: ERROR: column "images" is of type jsonb but expression is of type text
Fix: Make sure image URLs are in proper JSONB or TEXT array format
Use jsonb_build_array() function
```

---

## ✅ SUCCESS INDICATORS

After running each command, look for:

✅ Status Message: "Query executed successfully"
✅ Rows affected: Usually 0-1 for schema changes, 1-N for data updates
✅ No error messages in red
✅ Green checkmark in SQL Editor

---

## 📊 VERIFY THE MIGRATION

Run this to see all your hotels with the new columns:

```sql
SELECT 
  id,
  name,
  city,
  images,
  description,
  price_per_night,
  amenities,
  meal_options
FROM public.hotels
LIMIT 5;
```

---

## 🎯 COMPLETION CHECKLIST

- [ ] Opened Supabase SQL Editor
- [ ] Copied all SQL commands
- [ ] Pasted into query box
- [ ] Clicked "Run"
- [ ] Got success message
- [ ] Verified columns exist
- [ ] Updated hotel data with images
- [ ] Verified data was updated
- [ ] Ready to use frontend features!

---

## 🆘 NEED HELP?

### Still Having Issues?
1. Check browser console for error messages (F12)
2. Verify hotel table exists: `SELECT * FROM public.hotels LIMIT 1;`
3. Check column types: `\d public.hotels`
4. Review Supabase documentation: https://supabase.com/docs
5. Contact support with error message

### Next Steps After SQL:
1. All 4 components are already created (check file structure)
2. Types are already updated
3. Zero code changes needed!
4. Just test in browser to verify working

---

**Status:** Ready to Execute ✅
**Time to Complete:** 2-3 minutes
**Difficulty:** Very Easy ⭐
