# ARCHITECTURE DIAGRAMS & VISUAL REFERENCES

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          TRIP PLANNER SYSTEM                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐                        ┌──────────────────┐
│   CUSTOMER APP   │                        │    ADMIN APP     │
│   (React/TS)     │                        │    (React/TS)    │
│                  │                        │                  │
│  - LoginPage     │◄──────────────────────►│  - AdminLogin    │
│  - Page1, Page2  │    Shared Services     │  - TripsListPage │
│  - Dashboard     │    & Data Models       │  - TripDetails   │
│  - MyTrips       │                        │  - OverviewPage  │
└────────┬─────────┘                        └────────┬─────────┘
         │                                           │
         │        ┌──────────────────────┐           │
         └───────►│  SERVICE LAYER       │◄──────────┘
                  │  (TypeScript)        │
                  │                      │
                  │ • authService        │
                  │ • tripService        │
                  │ • hotelRecommend.    │
                  │ • supabaseClient     │
                  │ • shared.types       │
                  └──────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
       ┌──────────────────┐      ┌──────────────────┐
       │   SUPABASE DB    │      │   SUPABASE DB    │
       │   (PostgreSQL)   │      │   (PostgreSQL)   │
       │                  │      │                  │
       │  • users         │      │  • hotels        │
       │  • trips         │      │  • trips         │
       │  • hotels        │      │  • users         │
       └──────────────────┘      └──────────────────┘
```

---

## Data Model Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                  UNIFIED DATA MODEL                         │
└─────────────────────────────────────────────────────────────┘

USER (users table)
├── id (UUID)
├── email (unique)
├── name
├── role ◄─────┐
│   ├─ 'customer'
│   └─ 'admin'
└─ created_at

    │
    │ owns many
    ▼

TRIP (trips table) ◄─── SOURCE OF TRUTH
├── id (UUID)
├── user_id (FK → User)
├── status (pending|recommended|accepted|rejected)
│
├── form_data (JSONB) ◄─── CUSTOMER'S ENTIRE FORM
│   ├─ email, name, contact, location (Page 1)
│   ├─ eventPurpose, preferredCities
│   ├─ numberOfPeople, duration
│   ├─ singleRooms, doubleRooms, tripleRooms, quadRooms
│   ├─ checkIn, checkOut (dates)
│   ├─ requiresEventHall, hallSetup, avRequirements
│   └─ meals, mealType, serviceStyle
│
├── system_recommendations (JSONB) ◄─── 2-3 HOTELS
│   ├─ [Hotel 1]
│   ├─ [Hotel 2]
│   └─ [Hotel 3]
│
├── approved_hotel_id (FK → Hotel) ◄─── ADMIN'S CHOICE
│
├── created_at (timestamp)
└── updated_at (timestamp)

    │
    ├─► References many ─────────►│
                                   │
                                   ▼

HOTEL (hotels table)
├── id (UUID)
├── name
├── location, city
├── star_rating (1-5)
├── amenities (TEXT[])
├── location_type (TEXT[]) ◄─ ['beach', 'city', 'nature', 'resort']
├── total_rooms
├── room_types (JSONB)
│   ├─ single: 50
│   ├─ double: 100
│   ├─ triple: 30
│   └─ quad: 20
├── event_hall_available
├── hall_capacity
├── audio_visual_equipment (TEXT[])
├── meal_options (TEXT[])
└── price_range ('budget'|'moderate'|'luxury')
```

---

## Request/Response Flow

```
CUSTOMER JOURNEY
════════════════════════════════════════════════════════════════

[1] LOGIN
┌─────────────────────────────────────┐
│ LoginPage.tsx                       │
│  - Email input                      │
│  - Password input                   │
│  - "Sign In" button                 │
└──────────────┬──────────────────────┘
               │
               │ calls authService.loginCustomer()
               ▼
┌──────────────────────────────────────┐
│ auth.service.ts                      │
│  - Check user exists                 │
│  - Verify role = 'customer'          │
│  - Store in localStorage             │
│  - Return User + Session             │
└──────────────┬───────────────────────┘
               │
               ▼
        ✓ Dashboard


[2] FILL FORM
┌─────────────────────────────────────┐
│ Page1.tsx                           │
│  - Name, Email, Contact, Location   │
│  - Next button                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Page2.tsx                           │
│  - Event Purpose, Cities, People    │
│  - Room Count, Dates                │
│  - Event Hall, Meals                │
│  - "Submit" button                  │
└──────────────┬──────────────────────┘
               │
               │ collects all form data
               ▼


[3] SUBMIT FORM
┌────────────────────────────────────┐
│ tripService.createTrip(formData)   │
│  - Validate form data              │
│  - Call recommendation engine      │
└──────────────┬─────────────────────┘
               │
               │ generates 2-3 hotels
               ▼
┌──────────────────────────────────┐
│ hotelRecommendation.service      │
│  - Score all hotels              │
│  - Return top 3                  │
└──────────────┬───────────────────┘
               │
               │ creates trip record in DB
               ▼
         Trip created with:
         ✓ form_data
         ✓ system_recommendations (2-3 hotels)
         ✓ status = "pending"


[4] CUSTOMER SEES DASHBOARD
┌──────────────────────────────────┐
│ CustomerTripsPage.tsx            │
│  - List of customer's trips      │
│  - Filter by status              │
│  - "My Trips" button             │
└──────────────┬───────────────────┘
               │
               │ calls tripService.getCustomerTrips()
               ▼
        Shows: "Waiting for admin..."
        Status: PENDING


ADMIN JOURNEY
════════════════════════════════════════════════════════════════

[1] LOGIN
│  Similar to customer
│  └─ authService.loginAdmin()
│  └─ role = 'admin'


[2] SEE PENDING TRIPS
┌──────────────────────────────────┐
│ TripsListPage.tsx                │
│  - Status filter: PENDING        │
│  - List all pending trips        │
└──────────────┬───────────────────┘
               │
               │ calls tripService.getTripsByStatus('pending')
               ▼
        Shows pending trips from all customers


[3] REVIEW & RECOMMEND
┌──────────────────────────────────┐
│ TripDetailsModal.tsx             │
│  - Show trip form_data           │
│  - Show 2-3 hotels              │
│  - Select 1 hotel               │
│  - "Approve" button             │
└──────────────┬───────────────────┘
               │
               │ calls tripService.approveHotel(tripId, hotelId)
               ▼
┌──────────────────────────────────┐
│ tripService.ts                   │
│  - Verify hotel in recommendations
│  - Set approved_hotel_id         │
│  - Update status → "recommended" │
│  - Save to DB                    │
└──────────────┬───────────────────┘
               │
               ▼
        Trip ready for customer review


BACK TO CUSTOMER
════════════════════════════════════════════════════════════════

[4] SEE RECOMMENDATION
┌──────────────────────────────────┐
│ CustomerTripsPage.tsx            │
│  - Trip status: RECOMMENDED      │
│  - Show approved hotel details   │
│  - Accept / Reject buttons       │
└──────────────┬───────────────────┘
               │
            Accept                  Reject
               │                        │
               │                        │
      tripService.                tripService.
      acceptRecommendation()       rejectRecommendation()
               │                        │
               ▼                        ▼
        status → ACCEPTED         status → REJECTED
        ✓ FINAL (read-only)      Admin can retry


[5] IF REJECTED
       └─► Admin sees rejected trip
       └─► Selects different hotel from same recommendations
       └─► Trip status → "recommended" (retry)
       └─► Back to step [4]
```

---

## Component Communication

```
CUSTOMER APP FLOW
═════════════════════════════════════════════════════════

App.tsx (Main Router)
├─ Check authentication ──► authService.isAuthenticated()
├─ Render screens
│
├─ Screen: "login" ──────────────────► LoginPage
│                   onLogin ────────────► AuthService
│                                              │
│                                              ▼
│                                    localStorage update
│
├─ Screen: "form1" ──────────────────► Page1
│
├─ Screen: "form2" ──────────────────► Page2
│                   onSubmit ────────────► tripService.createTrip()
│                                              │
│                                              ├─► hotelRecommendation
│                                              └─► Supabase DB
│
└─ Screen: "my-trips" ────────────────► CustomerTripsPage
                      onLoad ────────────► tripService.getCustomerTrips()
                                              │
                                              ▼
                                         Supabase DB


ADMIN APP FLOW
═════════════════════════════════════════════════════════

AdminLayout (Main Router)
├─ Check authentication
├─ Render pages
│
├─ Page: TripsListPage
│        onLoad ────────────► tripService.getTripsByStatus()
│                                 │
│        onSelectTrip ────────────────────► TripDetailsModal
│                              onLoad ────────► tripService.getTrip()
│
│                     onApproveHotel ──────► tripService.approveHotel()
│                                              │
│                                              └─► Update DB
│                                              └─► Re-fetch trips
│
└─ Page: OverviewPage
         onLoad ────────────► tripService.getTripsByStatus() (all statuses)
                                 │
                                 ▼
                            Show statistics
```

---

## Status Transition Diagram

```
                ┌──────────────────────────────────────────────┐
                │                                              │
                │          TRIP STATUS LIFECYCLE              │
                │                                              │
                └──────────────────────────────────────────────┘


    ┌────────────────────────────────────────────────────────┐
    │  CUSTOMER SUBMITS FORM                                 │
    │  tripService.createTrip()                              │
    └─────────────────┬──────────────────────────────────────┘
                      │
                      │ Auto-generate recommendations
                      │ (hotelRecommendation.generateRecommendations)
                      │
                      ▼
        ┌──────────────────────────┐
        │  PENDING                 │
        │  (awaiting admin review)  │
        └────────────┬─────────────┘
                     │
                     │ Only admin can see
                     │ tripService.getTripsByStatus('pending')
                     │
                     │ Admin reviews trip details
                     │ Admin selects 1 hotel from system_recommendations
                     │ tripService.approveHotel(tripId, hotelId)
                     │
                     ▼
        ┌──────────────────────────┐
        │  RECOMMENDED             │
        │  (customer can decide)    │
        └────────┬──────────────────┘
                 │
        ┌────────┴───────────┐
        │                    │
    ACCEPT              REJECT
        │                    │
        │                    │
   tripService.          tripService.
   acceptRecommendation() rejectRecommendation()
        │                    │
        ▼                    ▼
        │            ┌──────────────────────────┐
        │            │  REJECTED                │
        │            │  (on hold)               │
        │            └────────┬─────────────────┘
        │                     │
        │                     │ Admin can:
        │                     │  - Select different hotel
        │                     │    (from same recommendations)
        │                     │  - Regenerate new recommendations
        │                     │
        │                     │ tripService.approveHotel()
        │                     │ OR
        │                     │ tripService.regenerateRecommendations()
        │                     │
        │                     └─────── goes back to RECOMMENDED ──┐
        │                                                         │
        ▼                                                         │
        │                                                         │
        │  tripService.acceptRecommendation()                    │
        │                                                         │
        ▼                                                         │
        ┌──────────────────────────┐◄────────────────────────────┘
        │  ACCEPTED                │
        │  (FINAL - read-only)     │
        │  ✓ Ready for booking     │
        └──────────────────────────┘

        NO FURTHER CHANGES ALLOWED
        Neither customer nor admin can modify
```

---

## Access Control Matrix (Visual)

```
                    CUSTOMER    ADMIN
                    ────────    ─────

VIEW OWN TRIPS        ✓         ✓
VIEW ALL TRIPS        ✗         ✓

CREATE TRIP           ✓         ✗
MODIFY FORM           ✗         ✗

SELECT HOTEL          ✗         ✓*
MODIFY STATUS         Limited   Yes*

ACTION TIMELINE:

PENDING    ───────┐
           (admin selects hotel)
           └──────► RECOMMENDED ──┬─► ACCEPTED (FINAL)
                                  │
                                  └─► REJECTED ──┐
                                       (retry)    │
                                       ◄──────────┘


WHAT EACH ROLE CAN DO:

CUSTOMER:
├─ Submit form ──────────► Creates trip + auto-recommendations
├─ View own trips ───────► See only their trips
├─ See recommendation ───► Only when status = "recommended"
├─ Accept ───────────────► status: recommended → accepted (FINAL)
└─ Reject ───────────────► status: recommended → rejected

ADMIN:
├─ View all trips ───────► See all customers' trips
├─ Review trip details ──► See form_data + system_recommendations
├─ Select hotel ─────────► Must be from generated list
├─ Approve hotel ────────► status: pending/recommended → recommended
├─ View rejected trips ──► Can retry with different hotel
├─ Regenerate options ───► Create new recommendations
└─ Cannot modify accepted trips
```

---

## Database Query Patterns

```
CUSTOMER QUERIES
═════════════════════════════════════════════════

1. Login
   SELECT * FROM users WHERE email = ? AND role = 'customer'

2. Get Own Trips
   SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC

3. Accept Recommendation
   UPDATE trips SET status = 'accepted' WHERE id = ? AND user_id = ?

4. View Trip Details
   SELECT * FROM trips WHERE id = ? AND user_id = ?


ADMIN QUERIES
═════════════════════════════════════════════════

1. Login
   SELECT * FROM users WHERE email = ? AND role = 'admin'

2. Get All Trips (by status)
   SELECT * FROM trips WHERE status = ? ORDER BY created_at DESC

3. Get All Trips
   SELECT * FROM trips ORDER BY created_at DESC

4. Approve Hotel
   UPDATE trips SET approved_hotel_id = ?, status = 'recommended' WHERE id = ?

5. Regenerate Recommendations
   UPDATE trips SET system_recommendations = ? WHERE id = ?


SHARED QUERIES
═════════════════════════════════════════════════

1. Get All Hotels (for recommendations)
   SELECT * FROM hotels

2. Get Single Trip
   SELECT * FROM trips WHERE id = ?

3. Get Hotels (filtered)
   SELECT * FROM hotels WHERE city IN (?, ?)
```

---

## Error Handling Flow

```
USER ACTION
    │
    ▼
API CALL (service.ts)
    │
    ├─ If successful
    │  ├─ Return: { success: true, data: ... }
    │  └─ Update UI
    │
    └─ If error
       ├─ Catch error
       ├─ Return: { success: false, error: "message" }
       └─ Show error message to user


EXAMPLE ERROR CASES:

Customer tries to see other customer's trip
├─ tripService.getTrip(tripId)
└─ Check: trip.user_id === currentUser.id
   └─ Return: { success: false, error: "Access denied" }

Admin selects hotel not in recommendations
├─ tripService.approveHotel(tripId, hotelId)
└─ Check: recommendationIds.includes(hotelId)
   └─ Return: { success: false, error: "Hotel not in recommendations" }

Customer tries to modify accepted trip
├─ tripService.acceptRecommendation(tripId)
└─ Check: trip.status === "recommended"
   └─ Return: { success: false, error: "Trip must be in recommended status" }
```

---

## File Organization

```
Trip Planer/
│
├── 📄 INTEGRATION_GUIDE.md ────────── Database setup
├── 📄 INTEGRATION_SUMMARY.md ─────── Overview of everything
├── 📄 IMPLEMENTATION_STEPS.md ────── Step-by-step updates
├── 📄 QUICK_START.md ─────────────── 5-minute reference
├── 📄 CODE_EXAMPLES.md ────────────── Ready-to-copy code
├── 📄 ARCHITECTURE_DIAGRAMS.md ───── This file
│
├── shared.types.ts ────────────────── Unified data model
├── supabaseClient.ts ──────────────── Supabase initialization
├── auth.service.ts ────────────────── Authentication
├── hotelRecommendation.service.ts ── Hotel matching engine
├── tripService.ts ─────────────────── Trip CRUD operations
│
├── customer/
│   ├── src/
│   │   ├── services/ ◄────────────── Copy service files here
│   │   ├── types/ ◄───────────────── Copy shared.types.ts here
│   │   ├── components/
│   │   │   ├── LoginPage.tsx (UPDATE)
│   │   │   ├── Page1.tsx (UPDATE)
│   │   │   ├── Page2.tsx (UPDATE)
│   │   │   ├── Dashboard.tsx (UPDATE)
│   │   │   └── CustomerTripsPage.tsx (NEW)
│   │   └── App.tsx (UPDATE)
│   ├── .env.local ◄───────────────── Add credentials
│   └── package.json
│
└── admin/
    ├── src/app/
    │   ├── services/ ◄────────────── Copy service files here
    │   ├── types/ ◄───────────────── Copy shared.types.ts here
    │   ├── components/
    │   │   ├── AdminLogin.tsx (UPDATE)
    │   │   ├── TripsListPage.tsx (UPDATE)
    │   │   ├── TripDetailsModal.tsx (UPDATE)
    │   │   └── OverviewPage.tsx (UPDATE)
    │   └── AdminLayout.tsx (UPDATE)
    ├── .env.local ◄───────────────── Add credentials
    └── package.json
```

---

