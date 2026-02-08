# Trip Planner - Customer & Admin App Integration Guide

## Overview
This document outlines the integration of two separate frontend apps (Customer & Admin) with a shared Supabase backend.

---

## SUPABASE SETUP REQUIREMENTS

### 1. Install Supabase in Both Apps

```bash
# In both customer/ and admin/ directories
npm install @supabase/supabase-js
```

### 2. Database Tables & Schema

Create the following tables in Supabase PostgreSQL:

#### **Table: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: hotels**
```sql
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  city VARCHAR(100),
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  amenities TEXT[],
  location_type TEXT[],
  total_rooms INTEGER,
  room_types JSONB, -- {single: 50, double: 100, triple: 30, quad: 20}
  event_hall_available BOOLEAN DEFAULT FALSE,
  hall_capacity INTEGER,
  audio_visual_equipment TEXT[],
  meal_options TEXT[],
  price_range VARCHAR(50), -- budget, moderate, luxury
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: trips** (MAIN TABLE - Source of Truth)
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'recommended', 'accepted', 'rejected')),
  
  -- Customer Form Data (unchanged structure)
  form_data JSONB, -- stores all customer form fields
  
  -- Automated Recommendations
  system_recommendations JSONB, -- array of 2-3 recommended hotels
  
  -- Admin Selection
  approved_hotel_id UUID REFERENCES hotels(id),
  
  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: hotel_database** (Pre-populated Master List)
Pre-populate this with 20-30 hotels from mockData.ts with various cities, star ratings, amenities.

---

## ENV VARIABLES

Create `.env.local` in **both customer/ and admin/** directories:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Get these from Supabase Dashboard → Settings → API

---

## FILE STRUCTURE

```
customer/
  src/
    services/
      ├── supabaseClient.ts        (Supabase initialization)
      ├── auth.service.ts          (Customer auth - shared logic)
      └── tripService.ts           (Trip CRUD operations)
    types/
      └── shared.types.ts          (Unified data models)
    
admin/
  src/
    services/
      ├── supabaseClient.ts        (Supabase initialization)
      ├── auth.service.ts          (Admin auth - shared logic)
      └── tripService.ts           (Trip CRUD operations)
    types/
      └── shared.types.ts          (Unified data models)
```

---

## KEY WORKFLOWS

### 1. Customer Submission
1. Customer fills form (Page 1 + Page 2)
2. On "Submit":
   - Save `form_data`
   - Call hotel recommendation engine → generates `system_recommendations`
   - Set `status = "pending"`
   - Create trip record in DB

### 2. Admin Review
1. Admin sees all `pending` + `recommended` trips
2. Click trip → see `system_recommendations` (2-3 hotels)
3. Select ONE hotel → save `approved_hotel_id`
4. Set `status = "recommended"`

### 3. Customer Decision
1. Customer sees trips where `status = "recommended"`
2. Shows recommended hotel details
3. Can ACCEPT → `status = "accepted"` (final, read-only)
4. Can REJECT → `status = "rejected"` (admin can retry)

### 4. Rejection Flow
1. If rejected, admin sees trip in `rejected` status
2. Admin can select another hotel from `system_recommendations`
3. Or system regenerates recommendations
4. Move back to `status = "recommended"`

---

## NEXT STEPS

1. ✅ Create Supabase tables (SQL provided above)
2. ✅ Install `@supabase/supabase-js` in both apps
3. ✅ Add `.env.local` with Supabase credentials
4. ⏳ Implement shared types (shared.types.ts)
5. ⏳ Implement Supabase client (supabaseClient.ts)
6. ⏳ Implement services (auth, trips, recommendations)
7. ⏳ Update Customer App components
8. ⏳ Update Admin App components
9. ⏳ Test end-to-end workflow

---

