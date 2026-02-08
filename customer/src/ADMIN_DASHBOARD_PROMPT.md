# Admin Dashboard - ChatGPT Prompt

Use this prompt to generate the admin dashboard for your MICE Trip Planning System:

---

## 📋 PROMPT FOR CHATGPT:

```
I need to build an Admin Dashboard for my MICE Trip Planning System. Here's the context:

## SYSTEM OVERVIEW
This is a B2B trip planning platform where customers submit trip requirements, admins review them and recommend hotels, and customers accept/reject recommendations.

## CUSTOMER-SIDE (ALREADY BUILT)
- Login page
- Customer dashboard showing all their trips
- Trip submission forms (2 pages with detailed requirements)
- Ability to accept/reject hotel recommendations

## ADMIN DASHBOARD REQUIREMENTS

### USER AUTHENTICATION
- Admin login page (separate from customer login)
- Use role-based authentication (role: "admin")
- Admin credentials: email = "admin@tripcraft.com", password = "admin123" (for demo)

### DASHBOARD LAYOUT
Create a sidebar navigation with these sections:
1. Overview/Dashboard (stats and charts)
2. Trips Management
   - All Trips
   - Pending Requests (status: "pending")
   - Recommended (status: "recommended")
   - Accepted (status: "accepted")
   - Rejected (status: "rejected")
3. Settings

### MAIN FEATURES

#### 1. OVERVIEW PAGE
Show cards with statistics:
- Total trips count
- Pending requests count (needs action)
- Recommended count (waiting for customer)
- Accepted bookings count
- Rejected count (needs alternative)
- Recent trips list

#### 2. TRIPS TABLE
Display all trips in a data table with columns:
- Trip ID
- Customer Name
- Customer Email
- Destination
- Event Purpose
- Number of People
- Duration (days)
- Check-in Date
- Status (with colored badges)
- Submitted Date
- Actions (View Details, Recommend Hotel)

Features needed:
- Search by customer name, email, or destination
- Filter by status
- Sort by date, status, etc.
- Pagination (10 trips per page)

#### 3. TRIP DETAILS VIEW (Modal or Page)
When admin clicks "View Details", show comprehensive trip information:

**Section A: Customer Information**
- Name
- Email
- Contact Number

**Section B: Trip Basic Details**
- Destination
- Preferred Cities
- Event Purpose
- Number of People
- Duration
- Check-in Date
- Check-out Date

**Section C: Accommodation Preferences**
- Locations Nearby (tags)
- Stay Type (tags)
- Star Category (tags)
- Room Requirements:
  - Single Rooms: X
  - Double Rooms: X
  - Triple Rooms: X
  - Quad Rooms: X

**Section D: Event Requirements**
- Requires Event Hall: Yes/No
- Hall Setup Preferences (if yes): [list]
- Audio-Visual Requirements: [list]
- Event Services: [list]

**Section E: Meals & Refreshments**
- Meals: [list]
- Meal Type: [list]
- Service Style: [list]

**Section F: Current Status**
- Status badge
- If "recommended": Show current recommendation
- If "rejected": Show previously rejected hotel

**Section G: Actions**
- "Recommend Hotel" button (if status is pending or rejected)
- "Edit Recommendation" button (if status is recommended)
- "Contact Customer" button (email/phone actions)

#### 4. RECOMMEND HOTEL FORM
When admin clicks "Recommend Hotel", open a modal/drawer with form:

**Form Fields:**
- Hotel Name* (text input)
- Hotel Location* (text input)
- Star Rating* (dropdown: 3-star, 4-star, 5-star)
- Price per Night* (text input, example: "$250 per room per night")
- Description* (textarea, min 50 chars)
  Placeholder: "Explain why this hotel is perfect for their requirements"
- Amenities (multi-select checkboxes):
  - Conference Hall
  - Beachfront
  - Swimming Pool
  - Spa & Wellness
  - High-Speed WiFi
  - Business Center
  - Restaurant
  - Bar & Lounge
  - Gym & Fitness
  - Parking
  - Airport Transfer
  - Event Coordination Team
  - Audio-Visual Equipment
  - Outdoor Spaces
  - 24/7 Room Service
  [Option to add custom amenity]
- Total Estimated Cost (optional text input)
- Internal Notes (optional textarea, not visible to customer)

**Form Actions:**
- Cancel button
- "Send Recommendation" button (updates status to "recommended")

**On Submit:**
- Validate all required fields
- Update trip record with recommendation object
- Change status from "pending" to "recommended"
- Show success message
- Optionally: Send email notification to customer (future)
- Redirect back to trips list

#### 5. FILTER & SEARCH FUNCTIONALITY
Top bar with:
- Search box (searches name, email, destination)
- Status filter dropdown (All, Pending, Recommended, Accepted, Rejected)
- Date range picker (filter by submission date)
- Export button (CSV export of filtered results)

### STATUS COLOR CODING
- Pending: Orange (bg-orange-100, text-orange-800)
- Recommended: Purple (bg-purple-100, text-purple-800)
- Accepted: Green (bg-green-100, text-green-800)
- Rejected: Red (bg-red-100, text-red-800)

### DATA SOURCE
Use localStorage to read trips data (same as customer side):
```javascript
const trips = JSON.parse(localStorage.getItem('trips') || '[]');
```

When recommending hotel, update the trip object with:
```javascript
{
  ...existingTrip,
  status: 'recommended',
  recommendation: {
    hotelName: string,
    hotelLocation: string,
    starRating: number,
    pricePerNight: string,
    amenities: string[],
    description: string,
    totalEstimatedCost?: string,
    adminNotes?: string,
    recommendedAt: new Date().toISOString(),
    recommendedBy: 'admin@tripcraft.com'
  }
}
```

### DESIGN REQUIREMENTS
- Use same design system as customer dashboard (Tailwind CSS)
- Similar gradient theme (blue-purple-pink)
- Responsive layout
- Use Lucide React icons
- Modern, clean admin interface
- Data tables should be sortable and filterable

### ROUTING
- /admin/login - Admin login page
- /admin/dashboard - Overview page
- /admin/trips - All trips table
- /admin/trips?status=pending - Filtered by status
- /admin/trips/:id - Trip details view

### IMPORTANT NOTES
1. Admin can see ALL trips from ALL customers
2. Customer can only see their own trips
3. Admin dashboard is separate from customer dashboard
4. Use role="admin" to differentiate admin users
5. This is a demo, so authentication is simple (no real backend)

Please build a complete, production-ready admin dashboard with all these features.
```

---

## 🎯 ADDITIONAL SPECIFIC REQUESTS

If you want specific features, add these to the prompt:

### For Charts & Analytics:
```
Also add to Overview page:
- Line chart showing trips submitted over last 30 days
- Pie chart showing distribution of trip statuses
- Bar chart showing top 5 destinations
- Recent activity feed
Use recharts library for charts.
```

### For Advanced Features:
```
Additional features:
1. Bulk actions - select multiple trips and update status
2. Notes/Comments - admin can add internal notes to each trip
3. Timeline view - show history of status changes
4. Email templates - pre-built email templates for customer communication
5. Hotel database - separate section to manage hotel inventory
```

### For Better UX:
```
UX Enhancements:
1. Toast notifications for all actions (success/error)
2. Loading states for all API calls
3. Confirmation dialogs before changing status
4. Keyboard shortcuts (e.g., "n" for new recommendation)
5. Dark mode toggle
```

---

## 📦 COMPONENT STRUCTURE SUGGESTION

```
/components/admin/
├── AdminLogin.tsx
├── AdminLayout.tsx (sidebar + header)
├── Dashboard/
│   ├── Overview.tsx
│   ├── StatsCards.tsx
│   └── RecentTrips.tsx
├── Trips/
│   ├── TripsTable.tsx
│   ├── TripDetailsModal.tsx
│   ├── RecommendHotelForm.tsx
│   ├── FilterBar.tsx
│   └── StatusBadge.tsx
└── Shared/
    ├── Sidebar.tsx
    ├── Header.tsx
    └── EmptyState.tsx
```

---

## 🔗 INTEGRATION WITH EXISTING CODE

Make sure to tell ChatGPT:
```
The customer-side app already exists with these files:
- /App.tsx (customer routing)
- /components/LoginPage.tsx (customer login)
- /components/Dashboard.tsx (customer dashboard)
- /components/Page1.tsx and Page2.tsx (trip forms)
- /utils/demo-data.ts (demo data initialization)

Please create the admin dashboard as separate components that:
1. Don't conflict with existing customer components
2. Can be accessed via /admin routes
3. Share the same localStorage data structure
4. Use the same design tokens from /styles/globals.css

Add admin routing to App.tsx or create separate AdminApp.tsx - your choice.
```

---

Use this prompt with ChatGPT to generate your complete admin dashboard! 🚀
