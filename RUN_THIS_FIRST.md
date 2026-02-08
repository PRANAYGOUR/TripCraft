# 🚀 Complete Setup Instructions

Everything is ready! Follow these simple steps:

## Step 1: Install Dependencies (Already Done ✅)
```bash
# Customer App
cd customer
npm install

# Admin App
cd ../admin
npm install
```

## Step 2: Run the Database Setup Script

### Option A: Automatic Setup (Recommended) ⚡
```bash
node setup.js
```
This script will:
- Connect to your Supabase project
- Run all SQL commands automatically
- Create tables, indexes, and sample data
- Set up Row-Level Security policies

### Option B: Manual Setup via Supabase UI
1. Go to https://supabase.com → Your Project → SQL Editor
2. Create a new query
3. Copy all content from `SUPABASE_SETUP.sql`
4. Click "Run"
5. Wait for completion (should see green checkmark)

## Step 3: Start the Apps

### Start Customer App (Terminal 1)
```bash
cd customer
npm run dev
```
Open: http://localhost:5173

### Start Admin App (Terminal 2)
```bash
cd admin
npm run dev
```
Open: http://localhost:5174

## Step 4: Test the Workflow

### Login to Customer App
- Email: `customer@micetravel.com`
- Password: `demo`
- Click "Create Trip"
- Fill in details and submit

### Login to Admin Dashboard
- Email: `admin@micetravel.com`
- Password: `demo`
- View trips in "Overview"
- Click a trip to approve hotel recommendations
- Click "Approve Hotel" to send recommendation to customer

### Return to Customer App
- Refresh page (F5)
- See approved hotels in "My Recommendations"
- Accept or reject recommendations

## Test Credentials

### Customer Accounts:
- Email: `customer@micetravel.com` / Password: `demo`
- Email: `customer2@micetravel.com` / Password: `demo`

### Admin Accounts:
- Email: `admin@micetravel.com` / Password: `demo`
- Email: `admin2@micetravel.com` / Password: `demo`

## File Structure

```
Setup Files:
- setup.js                          ← Run this to execute SQL
- SUPABASE_SETUP.sql               ← Complete database schema
- RUN_THIS_FIRST.md                ← This file
- SETUP_INSTRUCTIONS.md            ← Detailed instructions

Customer App:
- customer/src/services/           ← All 5 backend services
- customer/src/types/shared.types.ts
- customer/.env.local              ← Supabase credentials ✅

Admin App:
- admin/src/app/services/          ← All 5 backend services  
- admin/src/app/types/shared.types.ts
- admin/.env.local                 ← Supabase credentials ✅
```

## Services Connected (✅ Ready)

1. **supabaseClient.ts** - Supabase connection
2. **auth.service.ts** - Login/logout for both apps
3. **tripService.ts** - Complete trip management
4. **hotelRecommendation.service.ts** - AI matching algorithm (7 dimensions)
5. **shared.types.ts** - Unified TypeScript types

## Backend Already Configured

✅ Environment variables loaded (.env.local in both apps)
✅ Supabase URL: `https://bxxpdlesrebnvqtxcmes.supabase.co`
✅ All services compiled and ready
✅ Authentication flow implemented
✅ Database schema ready to deploy

## Troubleshooting

### Port Already in Use?
```bash
# Kill process on port 5173 (customer)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill process on port 5174 (admin)
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

### SQL Execution Fails?
1. Verify Supabase project is accessible
2. Check credentials in setup.js are correct
3. Try manual SQL import via Supabase UI
4. Check browser console for error details

### Login Fails?
1. Run setup.sql first
2. Check browser console for errors
3. Verify Supabase credentials in .env.local

## What's Included?

✅ Full TypeScript application
✅ Role-based authentication (customer/admin)
✅ Real-time trip management
✅ Hotel recommendation algorithm
✅ Complete database schema
✅ Sample test data (4 users, 10 hotels)
✅ Responsive UI components
✅ Error handling and notifications

---

**Next Step:** Run `node setup.js` to initialize the database, then start both apps! 🎉
