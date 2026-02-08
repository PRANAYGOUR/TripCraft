# 🚀 SUPABASE INTEGRATION - SETUP INSTRUCTIONS

## ✅ What's Done (Framework Ready!)

- ✅ @supabase/supabase-js installed in both apps
- ✅ .env.local files created with your Supabase credentials
- ✅ All 5 service files copied to both apps
- ✅ Customer app LoginPage updated to use auth service
- ✅ Customer app App.tsx updated for authentication

## 📝 IMMEDIATE NEXT STEPS

### Step 1: Create Supabase Tables (5 minutes)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire content from `SUPABASE_SETUP.sql`
5. Paste it into the SQL editor
6. Click **Run**
7. Wait for success message ✅

**What this creates:**
- `users` table (with role-based access)
- `hotels` table (with 10 sample hotels)
- `trips` table (main data storage)
- Row-level security policies
- Helper functions

---

### Step 2: Verify Tables in Supabase

1. In your Supabase dashboard, go to **Table Editor**
2. You should see:
   - `users` table (with 4 sample users)
   - `hotels` table (with 10 sample hotels)
   - `trips` table (empty, ready for data)

3. Check the users table has:
   - `customer@example.com` (role: customer)
   - `admin@micetravel.com` (role: admin)

---

### Step 3: Test Customer App Locally

Run in customer app directory:
```bash
npm run dev
```

1. Open browser to `http://localhost:5173` (or shown port)
2. Login credentials:
   - Email: `customer@example.com`
   - Password: `demo`
3. You should see the dashboard ✅

---

### Step 4: Update Customer Dashboard Component

The Dashboard component needs to display trips from database. Replace the component (you'll handle this in next phase).

---

## 🏗️ Architecture Overview

```
CUSTOMER APP
├── LoginPage → authService.loginCustomer() → Supabase
├── Dashboard → tripService.getCustomerTrips() → Display trips
├── Page1 & Page2 → Collect form data
└── On Submit → tripService.createTrip() → Auto-generate recommendations

ADMIN APP
├── AdminLogin → authService.loginAdmin() → Supabase
├── TripsListPage → tripService.getAllTrips() → Filter by status
├── TripDetailsModal → tripService.approveHotel() → Update status
└── Workflow → pending → recommended → accepted/rejected

SUPABASE
├── users table (roles, session)
├── hotels table (20+ hotels with scoring data)
├── trips table (form data + recommendations)
└── Row-level security (customer isolation, admin oversight)
```

---

## 📊 Data Flow

### Customer Side
```
1. Customer fills form (Page 1 & 2)
2. Form submitted to tripService.createTrip()
3. Service auto-generates 2-3 hotel recommendations
4. Trip status set to "pending"
5. Data saved to Supabase
6. Customer sees "Thank you" message
7. Trip appears in dashboard
```

### Admin Side
```
1. Admin logs in
2. Sees list of "pending" trips
3. Opens trip to see:
   - Customer requirements (form data)
   - 2-3 recommended hotels
4. Admin clicks "Approve" on preferred hotel
5. Trip status changes to "recommended"
6. Customer sees recommendation
```

### Customer Response
```
1. Customer sees recommended hotel
2. Can accept → status = "accepted" (FINAL)
3. Or reject → status = "rejected"
4. If rejected, admin can retry with different hotel
```

---

## 🔑 Key Service Methods

### authService
```typescript
await authService.loginCustomer(email, password)
await authService.loginAdmin(email, password)
await authService.logout()
await authService.getCurrentUser()
authService.isAuthenticated()
authService.getUserRole()
```

### tripService
```typescript
// Customer
await tripService.createTrip(formData)
await tripService.getCustomerTrips()
await tripService.acceptRecommendation(tripId)
await tripService.rejectRecommendation(tripId)

// Admin
await tripService.getAllTrips()
await tripService.getTripsByStatus(status)
await tripService.approveHotel(tripId, hotelId)
await tripService.regenerateRecommendations(tripId)
```

### hotelRecommendationService
```typescript
await hotelRecommendationService.generateRecommendations(formData)
// Returns 2-3 hotels scored on 7 dimensions:
// 1. Location matching (25 pts)
// 2. Location type (20 pts)
// 3. Star rating (20 pts)
// 4. Room availability (20 pts)
// 5. Event hall (15 pts)
// 6. Meal options (10 pts)
// 7. Price range (10 pts)
```

---

## 📱 Demo Credentials

### Customer
- Email: `customer@example.com`
- Password: `demo`
- Role: Customer

### Admin
- Email: `admin@micetravel.com`
- Password: `demo`
- Role: Admin

---

## 🧪 Quick Test

### Test 1: Login (2 minutes)
1. Run customer app
2. Login with customer@example.com
3. Should see dashboard ✅

### Test 2: Admin Login (2 minutes)
1. Run admin app
2. Login with admin@micetravel.com
3. Should see admin dashboard ✅

### Test 3: Create Trip (5 minutes)
1. In customer app, click "New Trip"
2. Fill form page 1 & 2
3. Submit
4. Check Supabase: trips table should have new record ✅

### Test 4: Admin Approves (5 minutes)
1. In admin app, see the trip you just created
2. Click to view details
3. See 2-3 recommended hotels
4. Click "Approve" on one
5. Check Supabase: trip status should be "recommended" ✅

### Test 5: Customer Accepts (3 minutes)
1. Back to customer app dashboard
2. See the trip with "Recommended" status
3. Click "Accept"
4. Trip status should change to "Accepted" ✅

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- **Solution**: Check `.env.local` exists in customer and admin app directories
- Contains: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Error: "Customer not found"
- **Solution**: Make sure you ran the SQL setup and users table has data
- Run: `SELECT * FROM users WHERE role = 'customer'` in Supabase SQL editor

### Error: "Could not generate hotel recommendations"
- **Solution**: Check hotels table has data
- Run: `SELECT COUNT(*) FROM hotels` in Supabase SQL editor

### App not connecting to Supabase
- Check network tab in browser DevTools
- Check Supabase API is online
- Verify credentials in .env.local

### Status not updating
- Check RLS policies are enabled on trips table
- Check user is authenticated (check localStorage for userId)
- Check trip ID exists in database

---

## 🚢 Ready to Deploy?

Before production:

- [ ] Test complete customer → admin → customer workflow
- [ ] Verify all trip statuses update correctly
- [ ] Test RLS policies (customer can't see other trips)
- [ ] Test admin override (admin can see all trips)
- [ ] Verify hotel recommendations are accurate
- [ ] Update Dashboard component to fetch from database
- [ ] Update Page1 & Page2 to use CustomerFormData interface
- [ ] Remove demo credentials from code
- [ ] Enable proper authentication (JWT instead of localStorage)
- [ ] Add error boundaries and loading states
- [ ] Add email notifications

---

## 📚 Files Reference

| File | Location | Purpose |
|------|----------|---------|
| shared.types.ts | src/types/ | Unified data model |
| supabaseClient.ts | src/services/ | Supabase initialization |
| auth.service.ts | src/services/ | Authentication |
| tripService.ts | src/services/ | Trip operations |
| hotelRecommendation.service.ts | src/services/ | Hotel matching |
| SUPABASE_SETUP.sql | root/ | Database schema & seed data |
| .env.local | root/ | Environment variables |

---

## ✨ Next Phase

After verifying all the above works:

1. **Update Dashboard** to fetch customer's trips from database
2. **Update Page1 & Page2** to use CustomerFormData type
3. **Update Admin Components** to show real trip data
4. **Implement Trip Details Modal** for admin to approve hotels
5. **Add Real-time Updates** (optional: Supabase subscriptions)
6. **Production Deployment**

---

## 🎯 Success Indicators

✅ Customers can login with email/password
✅ Admin can login with email/password
✅ Customer can submit form and see "Thank you"
✅ Trip appears in Supabase trips table
✅ Admin sees trip in pending list
✅ Admin can approve hotel and trip status changes
✅ Customer sees recommendation
✅ Customer can accept/reject
✅ No console errors
✅ All data persists in Supabase

---

**Your Supabase integration framework is ready! 🚀**

Questions? Check:
- CODE_EXAMPLES.md (copy-paste examples)
- QUICK_START.md (API reference)
- ARCHITECTURE_DIAGRAMS.md (visual flows)
