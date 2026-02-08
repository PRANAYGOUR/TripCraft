import { useState } from 'react';
import { X, Eye, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import HotelDetailModal from './HotelDetailModal';
import { tripService } from '../services/tripService';
import { Trip } from '../types/admin';

interface TripDetailsModalProps {
  trip: Trip;
  onClose: () => void;
  onStatusChange: (newStatus: string) => void;
}

export function TripDetailsModal({ trip, onClose, onStatusChange }: TripDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [viewingHotel, setViewingHotel] = useState<any>(null);
  const [descriptionText, setDescriptionText] = useState<string>(trip.description || '');

  const handleUpdateStatus = async (newStatus: string, hotelId?: string, description?: string) => {
    setIsUpdating(true);
    try {
      console.log('📤 Updating trip status to:', newStatus, 'with hotel:', hotelId);
      // Prefer the specialized API when available (keeps audit fields consistent)
      let result;
      if (newStatus === 'recommended' && hotelId) {
        // Use approve path which accepts an optional description
        result = await tripService.approveHotel(trip.id, hotelId, description);
      } else {
        result = await tripService.updateTrip(trip.id, {
          status: newStatus,
          ...(hotelId && { approved_hotel_id: hotelId }),
          ...(typeof description !== 'undefined' && { description: description }),
        });
      }

      if (result.success) {
        console.log('✅ Trip updated successfully');
        setSelectedHotel(''); // Reset selection
        onStatusChange(newStatus);
        onClose();
      } else {
        console.error('❌ Error updating trip:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateRecommendations = async () => {
    setIsUpdating(true);
    try {
      console.log('🔄 Regenerating recommendations for trip:', trip.id);
      const result = await tripService.regenerateRecommendations(trip.id);

      if (result.success) {
        console.log('✅ Recommendations regenerated successfully:', result.data);
        console.log('📋 New hotels:', result.data?.recommended_hotels);
        // Status is now 'recommended' with new hotels
        onStatusChange('recommended');
        onClose();
      } else {
        console.error('❌ Error regenerating recommendations:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error regenerating recommendations: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Trip Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X size={24} />
            </button>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-semibold">{trip.customerName || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{trip.customerEmail}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold capitalize">{trip.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-semibold">{trip.destination}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Travelers</p>
              <p className="font-semibold">{trip.numberOfPeople || trip.travelers} people</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="font-semibold">{formatDate(trip.checkInDate || trip.start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p className="font-semibold">{formatDate(trip.checkOutDate || trip.end_date)}</p>
            </div>
            {trip.budget && (
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold">${trip.budget}</p>
              </div>
            )}
            {trip.form_data?.travelStyle && (
              <div>
                <p className="text-xs text-muted-foreground">Travel Style</p>
                <p className="font-semibold capitalize">{trip.form_data.travelStyle}</p>
              </div>
            )}
          </div>

          {/* Description / Notes (admin editable when sending/resending) */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground">Description / Notes</label>
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Optional note to send to customer (reason for selection or context)"
              className="mt-2 w-full p-2 border rounded resize-none"
              rows={3}
            />
          </div>

          {/* Recommendations */}
          {trip.recommended_hotels && trip.recommended_hotels.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">System Recommendations</h3>
              <div className="space-y-2">
                {trip.recommended_hotels.map((hotel: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded transition-colors flex justify-between items-center ${
                      selectedHotel === hotel.id
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedHotel(hotel.id)}
                    >
                      <p className="font-medium">{hotel.name || 'Hotel ' + (idx + 1)}</p>
                      {hotel.location && <p className="text-sm text-muted-foreground">{hotel.location}</p>}
                    </div>
                    <button
                      onClick={() => setViewingHotel(hotel)}
                      className="ml-2 p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      title="View hotel details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {trip.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    if (!selectedHotel) {
                      alert('Please select a hotel first');
                      return;
                    }
                    handleUpdateStatus('recommended', selectedHotel, descriptionText);
                  }}
                  disabled={isUpdating || !selectedHotel}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  {isUpdating ? 'Sending...' : selectedHotel ? '📧 Send Selected Hotel' : '📧 Select Hotel First'}
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected', undefined, descriptionText)}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : '❌ Reject Trip'}
                </button>
              </>
            )}
            {trip.status === 'recommended' && (
              <>
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <p className="text-sm text-green-800">
                    ✅ <strong>Hotel recommendation sent to customer.</strong>
                    <br />
                    <span className="text-xs">Waiting for customer to accept or reject...</span>
                  </p>
                </div>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : '❌ Cancel & Re-recommend'}
                </button>
              </>
            )}
            {trip.status === 'rejected' && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Customer rejected the recommendation.</strong>
                    {trip.description && (
                      <>
                        <br />
                        <span className="text-xs">Note: {trip.description}</span>
                      </>
                    )}
                  </p>
                </div>
                
                {/* PRIMARY: Regenerate New Recommendations */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    🔄 Generate Fresh Recommendations
                  </p>
                  <p className="text-xs text-blue-800 mb-3">
                    Create new hotel recommendations based on the customer's preferences.
                  </p>
                  <button
                    onClick={handleRegenerateRecommendations}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    {isUpdating ? 'Generating...' : 'Regenerate Recommendations'}
                  </button>
                </div>

                {/* SECONDARY: Or resend one of the original recommendations */}
                {trip.recommended_hotels && trip.recommended_hotels.length > 0 && (
                  <>
                    <p className="text-sm font-semibold mb-2 text-gray-700">
                      Or resend one of the original recommendations:
                    </p>
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                      {trip.recommended_hotels.map((hotel: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3 border rounded cursor-pointer transition-colors flex justify-between items-center ${
                            selectedHotel === hotel.id
                              ? 'bg-blue-100 border-blue-500'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="flex-1"
                            onClick={() => setSelectedHotel(hotel.id)}
                          >
                            <p className="font-medium">{hotel.name || 'Hotel ' + (idx + 1)}</p>
                            {hotel.location && <p className="text-xs text-gray-600">{hotel.location}</p>}
                            <p className="text-xs text-gray-500">${hotel.price_per_night}/night</p>
                          </div>
                          <button
                            onClick={() => setViewingHotel(hotel)}
                            className="ml-2 p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            title="View hotel details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        console.log('📧 Resending recommendation. Selected hotel ID:', selectedHotel);
                        if (!selectedHotel) {
                          alert('Please select a hotel first');
                          return;
                        }
                        handleUpdateStatus('recommended', selectedHotel, descriptionText);
                      }}
                      disabled={isUpdating || !selectedHotel}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isUpdating ? 'Sending...' : `📧 Resend Selected Hotel${selectedHotel ? ' ✓' : ''}`}
                    </button>
                  </>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </Card>

      {/* Hotel Detail Modal */}
      {viewingHotel && (
        <HotelDetailModal
          hotel={viewingHotel}
          onClose={() => setViewingHotel(null)}
          isCustomerView={false}
        />
      )}
    </div>
  );
}
