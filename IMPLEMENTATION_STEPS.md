# IMPLEMENTATION STEPS - Complete Integration Guide

## PHASE 1: Setup (15 minutes)

### Step 1.1: Install Supabase in Both Apps
```bash
cd customer
npm install @supabase/supabase-js

cd ../admin
npm install @supabase/supabase-js
```

### Step 1.2: Create `.env.local` in Both Apps
**customer/.env.local**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

**admin/.env.local**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Step 1.3: Create Services Directory Structure
```bash
# In customer app
mkdir -p src/services
mkdir -p src/types

# In admin app
mkdir -p src/app/services
mkdir -p src/app/types
```

### Step 1.4: Copy Service Files
Copy these files to both apps:

**customer/src/services/**
- supabaseClient.ts
- auth.service.ts
- hotelRecommendation.service.ts
- tripService.ts

**customer/src/types/**
- shared.types.ts

**admin/src/app/services/**
- supabaseClient.ts
- auth.service.ts
- hotelRecommendation.service.ts
- tripService.ts

**admin/src/app/types/**
- shared.types.ts

### Step 1.5: Setup Supabase Database
Run these SQL queries in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hotels table
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  city VARCHAR(100),
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  amenities TEXT[],
  location_type TEXT[],
  total_rooms INTEGER,
  room_types JSONB,
  event_hall_available BOOLEAN DEFAULT FALSE,
  hall_capacity INTEGER,
  audio_visual_equipment TEXT[],
  meal_options TEXT[],
  price_range VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trips table (MAIN)
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'recommended', 'accepted', 'rejected')),
  form_data JSONB,
  system_recommendations JSONB,
  approved_hotel_id UUID REFERENCES hotels(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Customers can only see their own trips
CREATE POLICY "Customers see own trips"
  ON trips FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all trips
CREATE POLICY "Admins see all trips"
  ON trips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Everyone can read hotels
CREATE POLICY "Anyone can read hotels"
  ON hotels FOR SELECT
  USING (true);
```

### Step 1.6: Seed Hotels Data
Insert your hotel data from mockData.ts into the hotels table. Use Supabase UI or:

```sql
INSERT INTO hotels (name, location, city, star_rating, amenities, location_type, total_rooms, room_types, event_hall_available, hall_capacity, audio_visual_equipment, meal_options, price_range) VALUES
('Grand Beach Resort', 'Beachfront, Goa', 'Goa', 5, ARRAY['Pool', 'Spa', 'Beach Access', 'Restaurant', 'Bar', 'Gym'], ARRAY['beach', 'resort'], 200, '{"single": 50, "double": 100, "triple": 30, "quad": 20}', true, 500, ARRAY['Projector', 'Sound System', 'Microphones', 'Stage'], ARRAY['Breakfast', 'Lunch', 'Dinner', 'Snacks'], 'luxury'),
-- ... add more hotels
```

### Step 1.7: Create Demo Users
Insert test users for development:

```sql
INSERT INTO users (email, name, role) VALUES
('customer@example.com', 'Demo Customer', 'customer'),
('admin@micetravel.com', 'Demo Admin', 'admin');
```

---

## PHASE 2: Update Customer App (1-2 hours)

### Step 2.1: Update LoginPage.tsx
Replace localStorage with auth service:

```tsx
// Old
localStorage.setItem('userEmail', email);

// New
import { authService } from '../services/auth.service';

const handleLogin = async (email: string) => {
  const result = await authService.loginCustomer(email, ''); // no password for demo
  if (result.success) {
    setUserEmail(email);
    setCurrentScreen('dashboard');
  } else {
    showError(result.error);
  }
};
```

### Step 2.2: Update App.tsx
Replace localStorage logout and login check:

```tsx
import { authService } from './services/auth.service';
import { tripService } from './services/tripService.ts';

useEffect(() => {
  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    const user = await authService.getCurrentUser();
    if (user) {
      setUserEmail(user.email);
      setCurrentScreen('dashboard');
    }
  }
}, []);

const handleLogout = () => {
  authService.logout();
  setCurrentScreen('login');
};
```

### Step 2.3: Update Page2.tsx (Form Submission)
Replace form submission with backend call:

```tsx
import { tripService } from '../services/tripService';
import { hotelRecommendationService } from '../services/hotelRecommendation.service';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Create trip with auto-generated recommendations
  const result = await tripService.createTrip(formData);
  
  if (result.success) {
    console.log('Trip created:', result.data);
    setCurrentScreen('success');
    // Optional: Show recommendations preview
  } else {
    showError(result.error);
  }
};
```

### Step 2.4: Create CustomerDashboard.tsx
New component to show trips and recommendations:

```tsx
import { useEffect, useState } from 'react';
import { tripService } from '../services/tripService';
import { Trip } from '../types/shared.types';

export default function CustomerDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    const result = await tripService.getCustomerTrips();
    if (result.success) {
      setTrips(result.data || []);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1>My Trips</h1>
      
      {trips.map((trip) => (
        <div key={trip.id} className="p-4 border rounded mb-4">
          <h2>Trip ID: {trip.id}</h2>
          <p>Status: <strong>{trip.status}</strong></p>
          
          {/* Show recommendation only when status = "recommended" */}
          {trip.status === 'recommended' && trip.approved_hotel_id && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3>Your Hotel Recommendation</h3>
              <HotelCard hotelId={trip.approved_hotel_id} />
              
              <div className="mt-4 space-x-2">
                <button onClick={() => handleAccept(trip.id)} className="btn btn-success">
                  Accept
                </button>
                <button onClick={() => handleReject(trip.id)} className="btn btn-danger">
                  Reject
                </button>
              </div>
            </div>
          )}
          
          {trip.status === 'accepted' && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <p className="text-green-700">✓ Trip Accepted - Ready for Booking</p>
            </div>
          )}
          
          {trip.status === 'rejected' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded">
              <p className="text-yellow-700">⚠ Awaiting Admin's New Recommendation</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const handleAccept = async (tripId: string) => {
  const result = await tripService.acceptRecommendation(tripId);
  if (result.success) {
    showSuccess('Recommendation accepted!');
    // Refresh trip
  }
};

const handleReject = async (tripId: string) => {
  const result = await tripService.rejectRecommendation(tripId);
  if (result.success) {
    showSuccess('Recommendation rejected. Admin will send another option.');
    // Refresh trip
  }
};
```

### Step 2.5: Update Customer App Navigation
Update App.tsx to show new screens:

```tsx
type Screen = 'login' | 'dashboard' | 'form1' | 'form2' | 'success' | 'my-trips';

// Add My Trips link in Dashboard
<button onClick={() => setCurrentScreen('my-trips')}>View My Trips</button>

// Render CustomerDashboard on 'my-trips' screen
```

---

## PHASE 3: Update Admin App (1-2 hours)

### Step 3.1: Update AdminLogin.tsx
Same as customer - use authService.loginAdmin()

```tsx
import { authService } from '../../services/auth.service';

const handleLogin = async (email: string) => {
  const result = await authService.loginAdmin(email, '');
  if (result.success) {
    setIsLoggedIn(true);
  } else {
    showError(result.error);
  }
};
```

### Step 3.2: Replace TripsListPage.tsx
Replace mockData with backend calls:

```tsx
import { useEffect, useState } from 'react';
import { tripService } from '../../services/tripService';
import { Trip, TripStatus } from '../../types/shared.types';

export default function TripsListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [statusFilter, setStatusFilter] = useState<TripStatus>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [statusFilter]);

  const loadTrips = async () => {
    setLoading(true);
    const result = await tripService.getTripsByStatus(statusFilter);
    if (result.success) {
      setTrips(result.data || []);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        {['pending', 'recommended', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as TripStatus)}
            className={`px-4 py-2 rounded ${
              statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {trips.map((trip) => (
          <TripRow key={trip.id} trip={trip} onUpdate={loadTrips} />
        ))}
      </div>
    </div>
  );
}

function TripRow({ trip, onUpdate }: { trip: Trip; onUpdate: () => void }) {
  return (
    <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
      <h3 className="font-bold">{trip.form_data.name}</h3>
      <p>Status: <strong>{trip.status}</strong></p>
      <p>Destination: {trip.form_data.preferredCities}</p>
      <p>People: {trip.form_data.numberOfPeople}</p>

      {trip.status === 'pending' && (
        <button
          onClick={() => navigateToDetails(trip.id)}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Review & Recommend Hotel
        </button>
      )}
    </div>
  );
}
```

### Step 3.3: Update TripDetailsModal.tsx
Show recommendations and handle hotel selection:

```tsx
import { useState } from 'react';
import { tripService } from '../../services/tripService';
import { Trip, Hotel } from '../../types/shared.types';

export default function TripDetailsModal({ trip, onClose, onUpdate }: Props) {
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApproveHotel = async () => {
    if (!selectedHotel) {
      alert('Please select a hotel');
      return;
    }

    setLoading(true);
    const result = await tripService.approveHotel(trip.id, selectedHotel);
    setLoading(false);

    if (result.success) {
      showSuccess('Hotel approved! Customer will see recommendation.');
      onUpdate(); // Refresh
      onClose();
    } else {
      showError(result.error);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    const result = await tripService.regenerateRecommendations(trip.id);
    setLoading(false);

    if (result.success) {
      // Update trip with new recommendations
      setTrip(result.data);
    }
  };

  return (
    <div className="modal">
      <h2>{trip.form_data.name}'s Trip</h2>

      {/* Form Details */}
      <div className="mb-4">
        <h3>Trip Requirements</h3>
        <p>Destination: {trip.form_data.preferredCities}</p>
        <p>Check-in: {trip.form_data.checkIn}</p>
        <p>Check-out: {trip.form_data.checkOut}</p>
        <p>People: {trip.form_data.numberOfPeople}</p>
        <p>Event Hall: {trip.form_data.requiresEventHall ? 'Yes' : 'No'}</p>
      </div>

      {/* System Recommendations */}
      <div className="mb-4">
        <h3>System Recommendations (Select ONE)</h3>
        <div className="space-y-2">
          {trip.system_recommendations.map((hotel: Hotel) => (
            <div
              key={hotel.id}
              onClick={() => setSelectedHotel(hotel.id)}
              className={`p-4 border rounded cursor-pointer ${
                selectedHotel === hotel.id ? 'border-blue-600 bg-blue-50' : ''
              }`}
            >
              <h4 className="font-bold">{hotel.name}</h4>
              <p>{hotel.location}</p>
              <p>⭐ {hotel.star_rating}/5 - {hotel.price_range}</p>
              <p>Rooms: Single {hotel.room_types.single}, Double {hotel.room_types.double}</p>
              <p>Event Hall: {hotel.event_hall_available ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-x-2">
        <button
          onClick={handleApproveHotel}
          disabled={!selectedHotel || loading}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Approve Selected Hotel
        </button>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded"
        >
          Regenerate Recommendations
        </button>
      </div>
    </div>
  );
}
```

### Step 3.4: Update OverviewPage.tsx (Admin Dashboard)
Show trip statistics from database:

```tsx
import { useEffect, useState } from 'react';
import { tripService } from '../../services/tripService';

export default function OverviewPage() {
  const [stats, setStats] = useState({
    pending: 0,
    recommended: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const pending = await tripService.getTripsByStatus('pending');
    const recommended = await tripService.getTripsByStatus('recommended');
    const accepted = await tripService.getTripsByStatus('accepted');
    const rejected = await tripService.getTripsByStatus('rejected');

    setStats({
      pending: pending.data?.length || 0,
      recommended: recommended.data?.length || 0,
      accepted: accepted.data?.length || 0,
      rejected: rejected.data?.length || 0,
    });
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Pending Review" value={stats.pending} color="orange" />
      <StatCard label="Recommended" value={stats.recommended} color="blue" />
      <StatCard label="Accepted" value={stats.accepted} color="green" />
      <StatCard label="Rejected" value={stats.rejected} color="red" />
    </div>
  );
}
```

---

## PHASE 4: Testing (1 hour)

### Test Case 1: End-to-End Workflow
1. **Customer Login** → Login as customer@example.com
2. **Fill Form** → Complete Page 1 & Page 2 with sample data
3. **Submit** → Form is saved, recommendations auto-generated
4. **Check Dashboard** → Trip shows "pending" status
5. **Admin Login** → Login as admin@micetravel.com
6. **Review Trip** → Admin sees pending trip
7. **Select Hotel** → Admin selects one from 3 recommendations
8. **Status Updated** → Trip changes to "recommended"
9. **Customer Check** → Customer sees recommendation
10. **Accept/Reject** → Customer accepts → Trip becomes "accepted" (final)

### Test Case 2: Rejection Workflow
1. Customer receives recommendation
2. Customer rejects → Trip status → "rejected"
3. Admin sees rejected trip
4. Admin selects different hotel from same recommendations
5. Trip → "recommended" again
6. Customer sees new recommendation

### Test Case 3: Access Control
- Customer A logs in → should NOT see Customer B's trips
- Admin logs in → sees all trips (any status)
- Customer cannot change accepted trips
- Only system-recommended hotels can be approved

---

## TROUBLESHOOTING

### "User not authenticated"
- Ensure localStorage has userId set after login
- Check auth.service.ts getCurrentUser() logic

### Recommendations empty
- Verify hotels table has data seeded
- Check hotelRecommendation.service.ts scoring logic
- Enable browser console logs

### Supabase connection errors
- Check .env.local variables
- Verify Supabase project is active
- Test with curl: `curl https://your-project.supabase.co/rest/v1/hotels`

### RLS Policy errors
- Check Row Level Security is enabled on tables
- Verify policies are created correctly
- Check auth context in policies

---

## DEPLOYMENT CHECKLIST

- [ ] All Supabase tables created
- [ ] Hotels data seeded
- [ ] Demo users created
- [ ] .env.local in both apps with correct credentials
- [ ] @supabase/supabase-js installed in both apps
- [ ] Service files copied to both apps
- [ ] Components updated with backend calls
- [ ] No localStorage for trip data (only auth tokens)
- [ ] Status-based UI rendering working
- [ ] End-to-end test passing

---

