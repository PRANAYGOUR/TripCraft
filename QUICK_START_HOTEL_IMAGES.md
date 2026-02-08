# QUICK REFERENCE - SQL COMMANDS FOR SUPABASE

## 🚀 FOLLOW THESE STEPS:

### Step 1: Login to Supabase Dashboard
- Go to https://app.supabase.com
- Select your project
- Click "SQL Editor" on left sidebar
- Click "+ New Query"

### Step 2: Copy ALL These Commands
```sql
-- ============================================
-- MODIFY HOTELS TABLE TO ADD MULTIPLE IMAGES
-- ============================================

-- Add images column as JSONB array to store 4-5 images per hotel
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;

-- Add description column for hotel details
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add price per night for better display
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS price_per_night INTEGER;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_hotels_created_at ON public.hotels(created_at DESC);
```

### Step 3: Run the Query
- Paste commands in SQL editor
- Click "Run" button (or Ctrl+Enter)
- You should see success message
- No errors should appear

### Step 4: Verify Changes
- Go to "Table Editor" on left sidebar
- Click on "hotels" table
- Scroll right to see new columns:
  - ✅ images (should be empty array [])
  - ✅ description (should be empty Text)
  - ✅ price_per_night (should be empty Number)

### Step 5: Add Sample Data (Optional)
```sql
-- Update ONE hotel with images
UPDATE public.hotels 
SET 
  images = jsonb_build_array(
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1631049456028-3a7325c0eeb5?w=800',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
    'https://images.unsplash.com/photo-1591825481567-db1554ae5dfc?w=800',
    'https://images.unsplash.com/photo-1551632986-6e0dba5cda14?w=800'
  ),
  description = 'Beautiful luxury hotel with world-class amenities',
  price_per_night = 250
WHERE name LIKE '%Hotel%' LIMIT 1;
```

---

## ✅ You're Done!

The database is now ready. The frontend components have been implemented to:
- Show 4-5 hotel images in a gallery
- Allow image navigation (previous/next)
- Display hotel details (amenities, rooms, meals)
- Enable approve/reject from detail view

### What's Ready:
- ✅ Admin can view hotel details with images
- ✅ Customer can view hotel details with images  
- ✅ Both can approve/reject from modal
- ✅ Image gallery with smooth navigation

### Files Created/Modified:
1. `/admin/src/app/components/HotelDetailModal.tsx` (NEW)
2. `/customer/src/components/HotelDetailModal.tsx` (NEW)
3. `/admin/src/app/types/shared.types.ts` (UPDATED)
4. `/customer/src/types/shared.types.ts` (UPDATED)
5. `/admin/src/app/components/TripDetailsModal.tsx` (UPDATED)
6. `/customer/src/components/Dashboard.tsx` (UPDATED)

---

## 🎯 Test It Out!

1. **Admin Test:**
   - Login as admin
   - Go to Trips page
   - Find a trip with recommendations
   - Click eye icon next to hotel name
   - View images gallery

2. **Customer Test:**
   - Login as customer
   - Go to Dashboard
   - Find recommended trip
   - Click "View Full Details & Images"
   - Click approve/reject in modal

---

**Time to Complete:** 5 minutes
**Complexity:** Easy (just run SQL commands)
**Status:** Ready to Deploy ✅
