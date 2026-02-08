# QUICK START - 5 Minute Setup Guide

## What's Been Created For You

✅ **shared.types.ts** - Unified data models (Trip, Hotel, User, FormData)
✅ **supabaseClient.ts** - Supabase initialization
✅ **auth.service.ts** - Login & session management (Customer & Admin)
✅ **hotelRecommendation.service.ts** - Rule-based hotel matching engine
✅ **tripService.ts** - Trip CRUD operations with access control
✅ **INTEGRATION_GUIDE.md** - Full database setup instructions
✅ **IMPLEMENTATION_STEPS.md** - Step-by-step component updates

---

## BEFORE YOU START

### 1. Install Supabase Package (2 mins)
```bash
# In customer/ directory
cd customer
npm install @supabase/supabase-js

# In admin/ directory
cd ../admin
npm install @supabase/supabase-js
```

### 2. Get Supabase Credentials (1 min)
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Settings → API
3. Copy: **Project URL** and **anon public key**

### 3. Create Environment Files (1 min)
Create `.env.local` in **customer/** and **admin/**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Create Database Tables (1 min)
Go to Supabase → SQL Editor → Run ALL queries from **INTEGRATION_GUIDE.md** under "Database Tables & Schema" section

### 5. Seed Initial Data (Optional - for testing)
Insert sample hotels and test users (see INTEGRATION_GUIDE.md)

---

## SERVICE LAYER OVERVIEW

### Files to Copy to BOTH Apps

**Customer App:**
```
customer/src/
  ├── services/
  │   ├── supabaseClient.ts
  │   ├── auth.service.ts
  │   ├── hotelRecommendation.service.ts
  │   └── tripService.ts
  └── types/
      └── shared.types.ts
```

**Admin App:**
```
admin/src/app/
  ├── services/
  │   ├── supabaseClient.ts
  │   ├── auth.service.ts
  │   ├── hotelRecommendation.service.ts
  │   └── tripService.ts
  └── types/
      └── shared.types.ts
```

---

## API QUICK REFERENCE

### Authentication
```typescript
import { authService } from './services/auth.service';

// Customer login
const result = await authService.loginCustomer(email, password);

// Admin login
const result = await authService.loginAdmin(email, password);

// Check if authenticated
if (authService.isAuthenticated()) { }

// Get current user
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

### Trips (Customer Perspective)
```typescript
import { tripService } from './services/tripService';

// Create new trip (auto-generates recommendations)
const result = await tripService.createTrip(formData);

// Get customer's trips only
const result = await tripService.getCustomerTrips();

// Get single trip
const result = await tripService.getTrip(tripId);

// Accept recommendation (status: recommended → accepted)
const result = await tripService.acceptRecommendation(tripId);

// Reject recommendation (status: recommended → rejected)
const result = await tripService.rejectRecommendation(tripId);
```

### Trips (Admin Perspective)
```typescript
import { tripService } from './services/tripService';

// Get ALL trips (admin only)
const result = await tripService.getAllTrips();

// Get trips by status
const result = await tripService.getTripsByStatus('pending');

// Approve hotel for trip (hotel must be in system_recommendations)
const result = await tripService.approveHotel(tripId, hotelId);

// Regenerate recommendations for rejected trip
const result = await tripService.regenerateRecommendations(tripId);
```

### Hotel Recommendations
```typescript
import { hotelRecommendationService } from './services/hotelRecommendation.service';

// Generate 2-3 recommendations (called automatically on trip creation)
const hotels = await hotelRecommendationService.generateRecommendations(formData);

// Debug: get detailed scores for all hotels
const scores = await hotelRecommendationService.getDetailedScores(formData);
```

---

## TRIP STATUS WORKFLOW

```
Customer submits form
    ↓
System creates trip: status = "pending"
System generates 2-3 recommendations
    ↓
ADMIN SEES: pending trips
Admin selects 1 hotel from recommendations
    ↓
Trip status → "recommended"
Trip approved_hotel_id set
    ↓
CUSTOMER SEES: recommendation
    ├─ Accept → status = "accepted" ✅ (FINAL - read-only)
    └─ Reject → status = "rejected"
         ↓
      ADMIN SEES: rejected trip
      Admin selects different hotel
         ↓
      Trip status → "recommended" (retry)
```

---

## FILE STRUCTURE (After Integration)

```
Trip Planer/
├── shared.types.ts          ← SHARED DATA MODEL
├── supabaseClient.ts        ← SHARED CONFIG
├── auth.service.ts          ← SHARED AUTH
├── hotelRecommendation.service.ts  ← SHARED ENGINE
├── tripService.ts           ← SHARED API
├── INTEGRATION_GUIDE.md     ← Database setup
├── IMPLEMENTATION_STEPS.md  ← Component updates
├── QUICK_START.md           ← This file
│
├── customer/
│   ├── src/
│   │   ├── services/        ← Copy services here
│   │   ├── types/           ← Copy shared.types.ts here
│   │   └── components/
│   │       ├── LoginPage.tsx        (UPDATE)
│   │       ├── Dashboard.tsx        (UPDATE)
│   │       ├── Page1.tsx            (UPDATE)
│   │       ├── Page2.tsx            (UPDATE)
│   │       └── CustomerDashboard.tsx (NEW)
│   └── .env.local           ← ADD credentials
│
└── admin/
    ├── src/app/
    │   ├── services/        ← Copy services here
    │   ├── types/           ← Copy shared.types.ts here
    │   └── components/
    │       ├── AdminLogin.tsx        (UPDATE)
    │       ├── TripsListPage.tsx     (UPDATE)
    │       ├── TripDetailsModal.tsx  (UPDATE)
    │       └── OverviewPage.tsx      (UPDATE)
    └── .env.local           ← ADD credentials
```

---

## NEXT STEPS

### Phase 1: Setup (Now)
- [ ] Install @supabase/supabase-js
- [ ] Create .env.local files
- [ ] Create Supabase tables (SQL from INTEGRATION_GUIDE.md)
- [ ] Seed hotels data
- [ ] Copy service files to both apps

### Phase 2: Customer App Updates (2 hours)
- [ ] Update LoginPage.tsx → use authService
- [ ] Update App.tsx → check authentication
- [ ] Update Page2.tsx → call tripService.createTrip()
- [ ] Create CustomerDashboard.tsx → show trips + recommendations
- [ ] Add Accept/Reject buttons → call tripService.acceptRecommendation/reject()

### Phase 3: Admin App Updates (2 hours)
- [ ] Update AdminLogin.tsx → use authService.loginAdmin()
- [ ] Update TripsListPage.tsx → call tripService.getAllTrips() or getTripsByStatus()
- [ ] Update TripDetailsModal.tsx → show system_recommendations + select hotel
- [ ] Add approval button → call tripService.approveHotel()
- [ ] Update OverviewPage.tsx → show stats from database

### Phase 4: Test (1 hour)
- [ ] Test customer submission → creates trip with recommendations
- [ ] Test admin review → sees pending trip
- [ ] Test admin selection → trip changes to "recommended"
- [ ] Test customer decision → sees recommendation + accept/reject
- [ ] Test rejection flow → admin can retry

---

## KEY VALIDATION RULES

✅ **Recommendations are SYSTEM-GENERATED only**
- Rule-based matching (destination, star rating, room count, event hall, meals)
- Admin can ONLY approve from generated list
- Cannot manually enter hotels

✅ **Status-based access control**
- Customer can only see own trips
- Admin can see all trips
- Only certain actions allowed per status

✅ **Trip becomes read-only when accepted**
- Once status = "accepted", no changes allowed
- Admin cannot modify accepted trips

✅ **Rejection workflow**
- If customer rejects, status = "rejected"
- Admin can select different hotel from same recommendations
- Or regenerate new recommendations
- Trip moves back to "recommended"

---

## COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| "VITE_SUPABASE_URL not found" | Add .env.local with credentials |
| "Supabase initialization failed" | Check URL format and anon key |
| "Can't read property 'id' of undefined" | Ensure user is logged in before calling services |
| "Hotel not in system recommendations" | Admin trying to approve hotel not generated by system |
| "Cannot modify accepted trips" | Trip is in final state, cannot make changes |
| "Access denied" | Customer trying to see another customer's trip |

---

## DEMO CREDENTIALS

After seeding users:
```
Customer:
  Email: customer@example.com
  Role: customer

Admin:
  Email: admin@micetravel.com
  Role: admin
```

---

## NEED HELP?

1. Check **INTEGRATION_GUIDE.md** for database setup
2. Check **IMPLEMENTATION_STEPS.md** for component examples
3. Review **shared.types.ts** for data structure
4. Check browser console for error messages
5. Use Supabase dashboard to inspect data directly

---

