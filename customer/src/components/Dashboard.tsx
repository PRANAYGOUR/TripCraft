import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import HotelDetailModal from './HotelDetailModal';
import { tripService } from '../services/tripService';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Clock,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  Plane,
  Building,
  Star,
  Check,
  X,
  Loader,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

interface Trip {
  id: string;
  email: string;
  name: string;
  location: string;
  eventPurpose: string;
  numberOfPeople: number;
  duration: number;
  checkIn: string | null;
  checkOut: string | null;
  status: 'pending' | 'recommended' | 'accepted' | 'rejected';
  submittedAt: string;
  approved_hotel_id?: string; // Track which hotel admin approved
  recommendation?: {
    hotelName: string;
    hotelLocation: string;
    starRating: number;
    pricePerNight: string;
    amenities: string[];
    description: string;
    imageUrl?: string;
  };
  // All recommended hotels
  allRecommendedHotels?: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    price_per_night: number;
    amenities: string[];
    image_url?: string;
  }>;
}

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  onNewTrip: () => void;
}

export default function Dashboard({ userEmail, onLogout, onNewTrip }: DashboardProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [viewingHotel, setViewingHotel] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadTrips();
  }, [userEmail]);

  // Auto-refresh every 5 seconds if there are rejected trips (admin might be regenerating)
  useEffect(() => {
    const hasRejectedTrips = trips.some(t => t.status === 'rejected');
    if (!hasRejectedTrips) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing trips (rejected trips detected)...');
      loadTrips();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [trips]);

  const loadTrips = async () => {
    try {
      setIsRefreshing(true);
      setError('');
      const result = await tripService.getCustomerTrips();
      if (result.success && result.data) {
        console.log('✅ Trips loaded from DB:', result.data);
        // Convert DB trip format to component Trip format
        const formattedTrips = (result.data as any[]).map(trip => {
          // Find the approved hotel if status is 'recommended'
          const approvedHotel = trip.status === 'recommended' && trip.approved_hotel_id
            ? trip.recommended_hotels?.find((h: any) => h.id === trip.approved_hotel_id)
            : trip.recommended_hotels?.[0];

          return {
            id: trip.id,
            email: trip.customer_id,
            name: trip.name || '',
            location: trip.destination,
            eventPurpose: trip.travel_style || '',
            numberOfPeople: trip.travelers || 0,
            // Use stored duration if present, otherwise compute from dates
            duration: trip.duration || (trip.start_date && trip.end_date ? Math.max(1, differenceInCalendarDays(new Date(trip.end_date), new Date(trip.start_date))) : 0),
            checkIn: trip.start_date,
            checkOut: trip.end_date,
            status: trip.status || 'pending',
            submittedAt: trip.created_at,
            approved_hotel_id: trip.approved_hotel_id,
            recommendation: approvedHotel ? {
              // Store full hotel object data
              id: approvedHotel.id,
              name: approvedHotel.name || 'Hotel',
              location: approvedHotel.location || '',
              city: approvedHotel.city || '',
              star_rating: approvedHotel.rating || approvedHotel.star_rating || 0,
              rating: approvedHotel.rating || 0,
              images: approvedHotel.images || [],
              image_url: approvedHotel.image_url || null,
              price_per_night: approvedHotel.price_per_night || 0,
              amenities: approvedHotel.amenities || [],
              meal_options: approvedHotel.meal_options || [],
              description: approvedHotel.description || '',
              // Simplified fields for display
              hotelName: approvedHotel.name || 'Hotel',
              hotelLocation: approvedHotel.location || '',
              starRating: approvedHotel.rating || 0,
              pricePerNight: `$${approvedHotel.price_per_night || 0}`,
              imageUrl: approvedHotel.image_url,
            } : undefined,
            // Store all recommended hotels but only show if rejected
            allRecommendedHotels: trip.recommended_hotels || [],
          };
        });
        setTrips(formattedTrips);
      } else {
        console.warn('Failed to load trips:', result.error);
        setError(result.error || 'Failed to load trips');
      }
    } catch (e) {
      console.error('Error loading trips:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered by user');
    await loadTrips();
  };

  const handleAcceptRecommendation = async (tripId: string) => {
    try {
      setIsProcessing(true);
      const result = await tripService.acceptRecommendation(tripId);
      if (result.success) {
        console.log('✅ Trip accepted');
        loadTrips(); // Reload from DB
      } else {
        console.error('Failed to update trip:', result.error);
      }
    } catch (e) {
      console.error('Error updating trip:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRecommendation = async (tripId: string, note: string = '') => {
    try {
      setIsProcessing(true);
      const result = await tripService.rejectRecommendation(tripId, note);
      if (result.success) {
        console.log('✅ Trip rejected');
        loadTrips(); // Reload from DB
      } else {
        console.error('Failed to update trip:', result.error);
      }
    } catch (e) {
      console.error('Error updating trip:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'recommended':
        return <Lightbulb className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'recommended':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'recommended':
        return 'Recommended';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">TripCraft Dashboard</h1>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="Refresh to see new recommendations from admin"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats & New Trip Button */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl mb-2">My Trips</h2>
              <p className="text-gray-600">
                {isLoading ? 'Loading trips...' : (trips.length === 0 ? 'No trips yet. Start planning your first trip!' : `You have ${trips.length} trip${trips.length !== 1 ? 's' : ''}`)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewTrip}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Plan New Trip
              </button>

              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Refresh trips"
                className="inline-flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Card className="p-4 mb-6 bg-red-50 border border-red-200">
              <p className="text-red-800">⚠️ {error}</p>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card className="p-8 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
              <p className="text-gray-600">Loading your trips from the database...</p>
            </Card>
          )}

          {/* Status Summary Cards */}
          {!isLoading && trips.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{trips.filter(t => t.status === 'pending').length}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{trips.filter(t => t.status === 'recommended').length}</p>
                    <p className="text-sm text-gray-600">Recommended</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{trips.filter(t => t.status === 'accepted').length}</p>
                    <p className="text-sm text-gray-600">Accepted</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{trips.filter(t => t.status === 'rejected').length}</p>
                    <p className="text-sm text-gray-600">Rejected</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Trips Grid */}
        {!isLoading && trips.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">
                Start planning your dream trip and let our MICE experts craft the perfect experience for you.
              </p>
              <button
                onClick={onNewTrip}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Plan Your First Trip
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="p-6 hover:shadow-xl transition-shadow flex flex-col">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    <span className="text-sm font-medium">{getStatusText(trip.status)}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(trip.submittedAt), 'MMM dd, yyyy')}
                  </span>
                </div>

                {/* Trip Details */}
                <div className="space-y-3 flex-grow">
                  <div>
                    <h3 className="text-lg mb-1">{trip.name}</h3>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{trip.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{trip.numberOfPeople} people</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{trip.duration} days</span>
                    </div>
                    {trip.checkIn && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(trip.checkIn), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Event Purpose:</p>
                    <p className="text-sm text-gray-700">{trip.eventPurpose || 'Not specified'}</p>
                  </div>

                  {/* Hotel Recommendation - When Admin has approved it */}
                  {trip.status === 'recommended' && trip.recommendation && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-purple-600" />
                            <h4 className="font-medium text-purple-900">{trip.recommendation.hotelName}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(trip.recommendation.starRating)].map((_: any, i: number) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-sm text-purple-800">{trip.recommendation.description}</p>
                        
                        <div className="text-sm text-purple-700">
                          <p className="mb-1"><span className="font-medium">Location:</span> {trip.recommendation.hotelLocation}</p>
                          <p><span className="font-medium">Price:</span> {trip.recommendation.pricePerNight}</p>
                        </div>

                        {trip.recommendation.amenities.length > 0 && (
                          <div className="pt-2 border-t border-purple-200">
                            <p className="text-xs text-purple-600 mb-2">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {trip.recommendation.amenities.map((amenity: any, idx: number) => (
                                <span key={idx} className="text-xs bg-white px-2 py-1 rounded-full text-purple-700">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            console.log('👁️ View button clicked!', trip.recommendation);
                            setViewingHotel(trip.recommendation);
                          }}
                          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          View Full Details & Images
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Accepted/Rejected Hotel Info */}
                  {(trip.status === 'accepted' || trip.status === 'rejected') && trip.recommendation && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className={`${trip.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 space-y-3`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Building className={`w-5 h-5 ${trip.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`} />
                            <h4 className={`font-medium ${trip.status === 'accepted' ? 'text-green-900' : 'text-red-900'}`}>
                              {trip.recommendation.hotelName}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(trip.recommendation.starRating)].map((_: any, i: number) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <p className={`text-xs ${trip.status === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
                          {trip.status === 'accepted' ? '✅ You accepted this recommendation' : '❌ You rejected this recommendation'}
                        </p>

                        {trip.status === 'rejected' && trip.description && (
                          <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                            <p className="font-medium">Your note:</p>
                            <p className="text-xs mt-1">{trip.description}</p>
                          </div>
                        )}

                        <div className="text-sm">
                          <p className="mb-1">
                            <span className={`inline-block w-2 h-2 mr-2 rounded-full ${trip.status === 'accepted' ? 'bg-green-600' : 'bg-red-500'}`} />
                            Location: {trip.recommendation.hotelLocation}
                          </p>
                          <p>
                            Price: {trip.recommendation.pricePerNight}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            console.log('👁️ View button clicked (Accepted/Rejected)!', trip.recommendation);
                            setViewingHotel(trip.recommendation);
                          }}
                          className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm font-medium  ${
                            trip.status === 'accepted'
                              ? 'bg-white border-green-300 text-green-700 hover:bg-green-100'
                              : 'bg-white border-red-300 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          <Eye size={16} />
                          View Full Details & Images
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons for Recommended Status */}
                {trip.status === 'recommended' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => handleAcceptRecommendation(trip.id)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => {
                        // Open the hotel detail modal so the customer can provide a rejection reason
                        console.log('Opening hotel modal to collect rejection reason', trip.recommendation);
                        setViewingHotel(trip.recommendation);
                      }}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}

                {/* Pending Status Message */}
                {trip.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      Waiting for admin to recommend a hotel...
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Detail Modal */}
      {viewingHotel && (
        <HotelDetailModal
          hotel={viewingHotel}
          onClose={() => {
            console.log('🚪 Closing hotel modal');
            setViewingHotel(null);
          }}
          onApprove={() => {
            // Robustly find the trip by hotel id (recommendation object reference may differ)
            const hotelId = viewingHotel?.id;
            const trip = trips.find((t: any) =>
              (t.recommendation && t.recommendation.id === hotelId) ||
              (t.recommended_hotels && t.recommended_hotels.some((h: any) => h.id === hotelId)) ||
              t.approved_hotel_id === hotelId
            );
            if (trip) {
              handleAcceptRecommendation(trip.id);
            } else {
              console.warn('Could not map viewingHotel to trip on approve:', viewingHotel);
            }
            setViewingHotel(null);
          }}
          onReject={(note: any) => {
            // Robustly find the trip by hotel id (recommendation object reference may differ)
            const hotelId = viewingHotel?.id;
            const trip = trips.find((t: any) =>
              (t.recommendation && t.recommendation.id === hotelId) ||
              (t.recommended_hotels && t.recommended_hotels.some((h: any) => h.id === hotelId)) ||
              t.approved_hotel_id === hotelId
            );
            if (trip) {
              handleRejectRecommendation(trip.id, note);
            } else {
              console.warn('Could not map viewingHotel to trip on reject:', viewingHotel, 'note:', note);
            }
            setViewingHotel(null);
          }}
          isCustomerView={true}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
}
