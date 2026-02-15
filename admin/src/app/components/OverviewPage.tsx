import { useState } from 'react';
import { Card } from './ui/card';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { TripDetailsModal } from './TripDetailsModal';
import HotelDetailModal from './HotelDetailModal';
import { Trip } from '../types/admin';

interface OverviewPageProps {
  onViewTrip: (tripId: string) => void;
  trips?: Trip[];
  onRefreshTrips?: () => void;
}

export function OverviewPage({ onViewTrip, trips = [], onRefreshTrips }: OverviewPageProps) {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [viewingHotel, setViewingHotel] = useState<any>(null);

  const stats = {
    total: trips.length,
    pending: trips.filter(t => t.status === 'pending').length,
    recommended: trips.filter(t => t.status === 'recommended').length,
    accepted: trips.filter(t => t.status === 'accepted').length,
    rejected: trips.filter(t => t.status === 'rejected').length
  };

  const recentTrips = [...trips]
    .sort((a, b) => {
      const dateA = new Date(a.submittedDate || a.created_at || '').getTime();
      const dateB = new Date(b.submittedDate || b.created_at || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 10);

  const statCards = [
    {
      label: 'Total Trips',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      label: 'Pending Requests',
      value: stats.pending,
      icon: Clock,
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-100'
    },
    {
      label: 'Recommended',
      value: stats.recommended,
      icon: AlertCircle,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-100'
    },
    {
      label: 'Accepted',
      value: stats.accepted,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-100'
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-100'
    }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="mt-1 text-indigo-100/90">Monitor and manage trip requests with quick actions</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Overview</p>
              <p className="text-3xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`p-6 border-0 shadow-md`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center bg-white/10 ${stat.color} shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Submissions */}
      <Card className="p-6">
        <h3 className="mb-4">Recent Trip Submissions</h3>
        {recentTrips.length === 0 ? (
          <p className="text-muted-foreground">No trips yet</p>
        ) : (
          <div className="grid gap-4">
            {recentTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-4 bg-white rounded-lg hover:shadow-lg transition-all border"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {/* show first recommended hotel image when available */}
                    {trip.recommended_hotels && trip.recommended_hotels[0] && trip.recommended_hotels[0].images && trip.recommended_hotels[0].images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={trip.recommended_hotels[0].images[0]} alt="hotel" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No Image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">
                        {trip.customerName || 'Unknown Customer'}
                      </p>
                      <StatusBadge status={trip.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {trip.destination} • {trip.numberOfPeople || trip.travelers} people • {formatDate(trip.checkInDate || trip.start_date || '')}
                    </p>
                    {trip.description && (
                      <p className="text-sm text-gray-700 mt-2">
                        {trip.description.length > 140 ? trip.description.slice(0, 140) + '…' : trip.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    <p className="text-xs">Submitted</p>
                    <p className="font-medium">{formatDate(trip.submittedDate || trip.created_at || '')}</p>
                  </div>
                </div>

                {/* Recommendations Display */}
                {trip.recommended_hotels && trip.recommended_hotels.length > 0 && (
                  <div className="mb-3 p-3 bg-purple-50 rounded border border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-2">
                      🏨 System Recommendations ({trip.recommended_hotels.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trip.recommended_hotels.map((hotel: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow-sm text-sm">
                          <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {hotel.images && hotel.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={hotel.images[0]} alt="h" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Img</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-800">{hotel.name || 'Hotel ' + (idx + 1)}</span>
                            <button
                              onClick={() => setViewingHotel(hotel)}
                              className="p-1 hover:bg-purple-100 rounded transition"
                              title="View hotel details"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onViewTrip(trip.id)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded hover:scale-[1.02] transition-transform shadow"
                  >
                    View Details
                  </button>
                  {trip.status === 'pending' && (
                    <span className="text-xs text-orange-600 font-medium self-center px-2">
                      Needs RFQ
                    </span>
                  )}
                  {trip.status === 'recommended' && (
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Approve Hotel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onStatusChange={(newStatus) => {
            // Refresh trips list from database
            setSelectedTrip(null);
            if (onRefreshTrips) {
              onRefreshTrips();
            }
          }}
        />
      )}

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