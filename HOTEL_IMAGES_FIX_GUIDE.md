# Hotel Images Fix - Migration Guide

## Problem
Images were not displaying in the hotel details modal because the `hotels` table in the database was missing the image-related fields.

## Solution
Add the missing fields to the hotels table and populate them with image URLs.

---

## **Step 1: Run the Migration SQL**

### Option A: Using Supabase Dashboard (Recommended)
1. Go to **Supabase Dashboard** → Select your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `MIGRATION_ADD_HOTEL_IMAGES.sql` file
5. Paste it into the SQL Editor
6. Click **Run** button

### Option B: Using psql CLI
If you have psql installed:
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f MIGRATION_ADD_HOTEL_IMAGES.sql
```

---

## **Step 2: Verify the Migration**

After running the SQL, verify that the columns were added:

```sql
-- Run this query in Supabase SQL Editor to check
SELECT 
  name, 
  image_url, 
  images, 
  price_per_night, 
  rating,
  description 
FROM hotels 
LIMIT 5;
```

You should see:
- ✅ `image_url` - Single image URL for each hotel
- ✅ `images` - Array of image URLs (for gallery)
- ✅ `price_per_night` - Price information
- ✅ `rating` - Hotel rating (1-5 stars)
- ✅ `description` - Hotel description

---

## **Step 3: Test the Application**

1. **Refresh your browser** (clear cache if needed)
2. **Login to customer dashboard**
3. **Create a new trip** or view existing trips
4. **Click "View Full Details & Images"** on a recommended hotel
5. **✅ Images should now display correctly!**

---

## **Added Fields**

| Field | Type | Purpose |
|-------|------|---------|
| `image_url` | TEXT | Primary image URL for quick display |
| `images` | TEXT[] | Array of multiple image URLs for gallery |
| `description` | TEXT | Detailed hotel description |
| `price_per_night` | NUMERIC | Nightly rate |
| `rating` | NUMERIC(2,1) | Star rating (e.g., 4.5) |

---

## **Sample Data Included**

The migration includes sample image URLs using placeholder.com service:
- Each hotel gets 2-3 placeholder images
- Price per night ranges from $80 to $400
- Ratings range from 3.5 to 4.9 stars

---

## **Using Real Images (Optional)**

To use real hotel images instead of placeholders:

1. Upload images to a cloud storage (AWS S3, Cloudinary, etc.)
2. Update the hotel records with real image URLs:

```sql
UPDATE hotels 
SET 
  image_url = 'https://your-cdn.com/hotels/luxury-resort-1.jpg',
  images = ARRAY[
    'https://your-cdn.com/hotels/luxury-resort-1.jpg',
    'https://your-cdn.com/hotels/luxury-resort-2.jpg',
    'https://your-cdn.com/hotels/luxury-resort-3.jpg'
  ]
WHERE name = 'Luxury Beach Resort';
```

---

## **Troubleshooting**

### Images still not showing?
- ✅ Ensure browser cache is cleared
- ✅ Check browser console for errors
- ✅ Verify Supabase connection is working
- ✅ Confirm all fields were added to hotels table

### Images showing broken icons?
- The placeholder.com service is being used as fallback
- Replace placeholder URLs with real image URLs
- Ensure image URLs are publicly accessible

### Getting SQL errors?
- Make sure you're running SQL in Supabase SQL Editor
- Check that you have admin/owner permissions
- Verify the database connection is active

---

## **Files Modified**

- `SUPABASE_SETUP.sql` - Updated hotels table schema
- `MIGRATION_ADD_HOTEL_IMAGES.sql` - Migration script to add fields

---

## **Next Steps**

After images are working:
1. ✅ Images display in modal when clicking "View Full Details"
2. ✅ Modal opens as a popup (not scrolled to bottom)
3. ✅ Customer can approve/reject with images visible
4. ✅ Admin can view all hotel images in modal

---

**Questions?** Check the browser console (F12) for any error logs.
