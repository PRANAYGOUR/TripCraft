# CODE EXAMPLES - Ready to Copy & Paste

## Part 1: Customer App - LoginPage.tsx Update

```tsx
import { useState } from 'react';
import { authService } from '../services/auth.service';
import { Mail, Lock, ChevronRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.loginCustomer(email, password);
      
      if (result.success) {
        onLogin(email);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-6">Sign in to your account</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Demo credentials:<br />
          email: customer@example.com
        </p>
      </div>
    </div>
  );
}
```

---

## Part 2: Customer App - Page2.tsx Submit Handler

```tsx
// Replace the existing handleSubmit function in Page2.tsx with this:

import { tripService } from '../services/tripService';
import { useState } from 'react';

export default function Page2({ onSubmit, initialData, onBack }: Page2Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare form data
      const formData = {
        ...initialData,
        // ... other fields
        checkIn: formData.checkIn?.toISOString() || null,
        checkOut: formData.checkOut?.toISOString() || null,
      };

      // Create trip with auto-generated recommendations
      const result = await tripService.createTrip(formData);

      if (result.success) {
        console.log('Trip created successfully:', result.data);
        // Call original onSubmit to navigate to success screen
        onSubmit(formData);
      } else {
        setError(result.error || 'Failed to submit form');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... existing JSX with updated button
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
    >
      {loading ? 'Submitting...' : 'Complete My Trip Plan'}
    </button>
  );
}
```

---

## Part 3: Customer App - New CustomerTripsPage.tsx

```tsx
import { useEffect, useState } from 'react';
import { tripService } from '../services/tripService';
import { Trip, Hotel } from '../types/shared.types';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

export default function CustomerTripsPage({ onLogout }: { onLogout: () => void }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    const result = await tripService.getCustomerTrips();
    if (result.success) {
      setTrips(result.data || []);
    } else {
      setError(result.error || 'Failed to load trips');
    }
    setLoading(false);
  };

  const handleAccept = async (tripId: string) => {
    const result = await tripService.acceptRecommendation(tripId);
    if (result.success) {
      alert('✓ Recommendation accepted! Your trip is confirmed.');
      loadTrips();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleReject = async (tripId: string) => {
    const result = await tripService.rejectRecommendation(tripId);
    if (result.success) {
      alert('✓ Recommendation rejected. Admin will send another option.');
      loadTrips();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Trips</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No trips yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({
  trip,
  onAccept,
  onReject,
}: {
  trip: Trip;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 border-yellow-200',
    recommended: 'bg-blue-50 border-blue-200',
    accepted: 'bg-green-50 border-green-200',
    rejected: 'bg-red-50 border-red-200',
  };

  const statusIcons: Record<string, JSX.Element> = {
    pending: <Clock className="w-5 h-5 text-yellow-600" />,
    recommended: <AlertCircle className="w-5 h-5 text-blue-600" />,
    accepted: <Check className="w-5 h-5 text-green-600" />,
    rejected: <X className="w-5 h-5 text-red-600" />,
  };

  const approvedHotel = trip.system_recommendations.find(
    (h) => h.id === trip.approved_hotel_id
  );

  return (
    <div className={`border-2 rounded-lg p-6 ${statusColors[trip.status]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{trip.form_data.name}</h2>
          <p className="text-gray-600">
            {trip.form_data.numberOfPeople} people • {trip.form_data.duration} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcons[trip.status]}
          <span className="font-semibold text-gray-700 uppercase text-sm">
            {trip.status}
          </span>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Destination</p>
          <p className="font-semibold text-gray-800">{trip.form_data.preferredCities}</p>
        </div>
        <div>
          <p className="text-gray-600">Check-in</p>
          <p className="font-semibold text-gray-800">
            {trip.form_data.checkIn ? new Date(trip.form_data.checkIn).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Event Purpose</p>
          <p className="font-semibold text-gray-800">{trip.form_data.eventPurpose}</p>
        </div>
        <div>
          <p className="text-gray-600">Check-out</p>
          <p className="font-semibold text-gray-800">
            {trip.form_data.checkOut ? new Date(trip.form_data.checkOut).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Recommendation Section */}
      {trip.status === 'recommended' && approvedHotel && (
        <div className="bg-white rounded-lg p-4 mb-4 border-2 border-blue-300">
          <h3 className="font-bold text-gray-800 mb-3">✨ Admin's Recommendation</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-600">Hotel</p>
              <p className="font-semibold text-gray-800">{approvedHotel.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Rating</p>
              <p className="font-semibold text-gray-800">{'⭐'.repeat(approvedHotel.star_rating)}</p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-semibold text-gray-800">{approvedHotel.city}</p>
            </div>
            <div>
              <p className="text-gray-600">Price Range</p>
              <p className="font-semibold text-gray-800 capitalize">{approvedHotel.price_range}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">{approvedHotel.location}</p>

          {/* Accept/Reject Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onAccept(trip.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Accept
            </button>
            <button
              onClick={() => onReject(trip.id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {trip.status === 'accepted' && (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
          <p className="text-green-800 font-semibold">✓ Trip Confirmed & Ready for Booking</p>
        </div>
      )}

      {trip.status === 'rejected' && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">⏳ Waiting for admin to send another recommendation...</p>
        </div>
      )}

      {trip.status === 'pending' && (
        <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-4">
          <p className="text-gray-800 font-semibold">⏳ Admin is reviewing your trip</p>
        </div>
      )}
    </div>
  );
}
```

---

## Part 4: Admin App - TripsListPage.tsx Update

```tsx
import { useEffect, useState } from 'react';
import { tripService } from '../../services/tripService';
import { Trip, TripStatus } from '../../types/shared.types';
import { Calendar, Users, MapPin } from 'lucide-react';

interface TripsListPageProps {
  onSelectTrip: (trip: Trip) => void;
  onLogout: () => void;
}

export default function TripsListPage({ onSelectTrip, onLogout }: TripsListPageProps) {
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

  const statusConfig: Record<TripStatus, { color: string; label: string; description: string }> = {
    pending: { color: 'yellow', label: 'Pending Review', description: 'Awaiting hotel selection' },
    recommended: { color: 'blue', label: 'Recommended', description: 'Waiting for customer decision' },
    accepted: { color: 'green', label: 'Accepted', description: 'Ready for booking' },
    rejected: { color: 'red', label: 'Rejected', description: 'Choose another hotel' },
  };

  const config = statusConfig[statusFilter];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Trip Management</h1>
            <p className="text-gray-600 mt-1">Review and recommend hotels for customer trips</p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['pending', 'recommended', 'accepted', 'rejected'] as TripStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                statusFilter === status
                  ? `bg-${statusConfig[status].color}-600 text-white`
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              {statusConfig[status].label}
              {/* Optional: Add count */}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className={`bg-${config.color}-50 border-2 border-${config.color}-300 rounded-lg p-4 mb-6`}>
          <h2 className={`font-semibold text-${config.color}-900`}>{config.label}</h2>
          <p className={`text-${config.color}-700 text-sm`}>{config.description}</p>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading trips...</p>
            </div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No trips in this category</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onSelect={onSelectTrip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, onSelect }: { trip: Trip; onSelect: (trip: Trip) => void }) {
  return (
    <div
      onClick={() => onSelect(trip)}
      className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition p-6 border-l-4 border-blue-600"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.form_data.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{trip.form_data.numberOfPeople} people</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{trip.form_data.duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{trip.form_data.preferredCities}</span>
            </div>
            <div>
              <span className="text-gray-700">{trip.form_data.eventPurpose}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-blue-600 text-lg">
            {trip.system_recommendations.length} Hotels
          </p>
          <p className="text-xs text-gray-500">
            {new Date(trip.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Part 5: Admin App - TripDetailsModal.tsx Update

```tsx
import { useState } from 'react';
import { tripService } from '../../services/tripService';
import { Trip, Hotel } from '../../types/shared.types';
import { X, CheckCircle, RefreshCw } from 'lucide-react';

interface TripDetailsModalProps {
  trip: Trip;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TripDetailsModal({ trip, onClose, onUpdate }: TripDetailsModalProps) {
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(trip.approved_hotel_id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApproveHotel = async () => {
    if (!selectedHotelId) {
      setError('Please select a hotel');
      return;
    }

    setLoading(true);
    setError('');

    const result = await tripService.approveHotel(trip.id, selectedHotelId);

    if (result.success) {
      alert('✓ Hotel approved! Customer will see this recommendation.');
      onUpdate();
      onClose();
    } else {
      setError(result.error || 'Failed to approve hotel');
    }

    setLoading(false);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setError('');

    const result = await tripService.regenerateRecommendations(trip.id);

    if (result.success) {
      alert('✓ Recommendations regenerated');
      onUpdate();
    } else {
      setError(result.error || 'Failed to regenerate');
    }

    setLoading(false);
  };

  const selectedHotel = trip.system_recommendations.find((h) => h.id === selectedHotelId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{trip.form_data.name}'s Trip</h2>
            <p className="text-gray-600">ID: {trip.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {/* Trip Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Destination</p>
              <p className="text-lg text-gray-800">{trip.form_data.preferredCities}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">People</p>
              <p className="text-lg text-gray-800">{trip.form_data.numberOfPeople}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Duration</p>
              <p className="text-lg text-gray-800">{trip.form_data.duration} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Event Purpose</p>
              <p className="text-lg text-gray-800">{trip.form_data.eventPurpose}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Event Hall</p>
              <p className="text-lg text-gray-800">
                {trip.form_data.requiresEventHall ? '✓ Required' : '✗ Not required'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Rooms Needed</p>
              <p className="text-lg text-gray-800">
                S:{trip.form_data.singleRooms} D:{trip.form_data.doubleRooms} T:{trip.form_data.tripleRooms} Q:{trip.form_data.quadRooms}
              </p>
            </div>
          </div>

          {/* System Recommendations */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              System-Generated Recommendations (Select ONE)
            </h3>

            {trip.system_recommendations.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No recommendations available</p>
            ) : (
              <div className="grid gap-4">
                {trip.system_recommendations.map((hotel) => (
                  <HotelOption
                    key={hotel.id}
                    hotel={hotel}
                    selected={selectedHotelId === hotel.id}
                    onSelect={() => setSelectedHotelId(hotel.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Selected Hotel Details */}
          {selectedHotel && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-3">Selected Hotel Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-semibold">Name</p>
                  <p className="text-blue-900">{selectedHotel.name}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Location</p>
                  <p className="text-blue-900">{selectedHotel.city}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Rating</p>
                  <p className="text-blue-900">{'⭐'.repeat(selectedHotel.star_rating)}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Price</p>
                  <p className="text-blue-900 capitalize">{selectedHotel.price_range}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Event Hall</p>
                  <p className="text-blue-900">
                    {selectedHotel.event_hall_available ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Total Rooms</p>
                  <p className="text-blue-900">{selectedHotel.total_rooms}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleApproveHotel}
              disabled={!selectedHotelId || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {loading ? 'Approving...' : 'Approve Selected Hotel'}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {loading ? '...' : 'Regenerate'}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelOption({
  hotel,
  selected,
  onSelect,
}: {
  hotel: Hotel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-800">{hotel.name}</h4>
          <p className="text-gray-600 text-sm mb-2">{hotel.location}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Rating</p>
              <p className="font-semibold">{'⭐'.repeat(hotel.star_rating)}</p>
            </div>
            <div>
              <p className="text-gray-600">Price</p>
              <p className="font-semibold capitalize">{hotel.price_range}</p>
            </div>
            <div>
              <p className="text-gray-600">Event Hall</p>
              <p className="font-semibold">{hotel.event_hall_available ? '✓' : '✗'}</p>
            </div>
            <div>
              <p className="text-gray-600">Rooms</p>
              <p className="font-semibold">{hotel.total_rooms}</p>
            </div>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
          selected
            ? 'border-blue-600 bg-blue-600'
            : 'border-gray-300'
        }`}>
          {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
      </div>
    </div>
  );
}
```

---

## Installation & Setup Command

```bash
# 1. Navigate to customer app
cd customer
npm install @supabase/supabase-js

# 2. Navigate to admin app
cd ../admin
npm install @supabase/supabase-js

# 3. Create .env.local in both directories with credentials:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 4. Copy service files to both apps
# 5. Update components as shown above
# 6. Run dev servers

# In customer/ terminal:
npm run dev

# In admin/ terminal:
npm run dev
```

---

