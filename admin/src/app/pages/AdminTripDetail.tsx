import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import { rfqService } from '../services/rfqService';
import { Trip, HotelRequest, Hotel } from '../types/shared.types';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

export function AdminTripDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [requests, setRequests] = useState<HotelRequest[]>([]);
    const [allHotels, setAllHotels] = useState<Hotel[]>([]); // New list
    const [loading, setLoading] = useState(true);
    const [expandedQuote, setExpandedQuote] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (tripId: string) => {
        const [tripRes, reqsRes, hotelsRes] = await Promise.all([
            tripService.getTrip(tripId),
            rfqService.getTripRequests(tripId),
            rfqService.getAvailableHotels()
        ]);

        if (tripRes.success && tripRes.data) setTrip(tripRes.data);
        if (reqsRes.success && reqsRes.data) {
            console.log('Hotel Requests:', reqsRes.data);
            setRequests(reqsRes.data);
        }
        if (hotelsRes.success && hotelsRes.data) setAllHotels(hotelsRes.data);
        setLoading(false);
    };

    const handleSendRFQ = async (hotel: Hotel) => {
        if (!trip) return;
        // Check if duplicate
        if (requests.some(r => r.hotel_id === hotel.id)) {
            alert("RFQ already sent to this hotel");
            return;
        }
        const res = await rfqService.createHotelRequest(trip.id, hotel.id);
        if (res.success) {
            loadData(trip.id); // Refresh
        } else {
            alert("Failed to send RFQ: " + res.error);
        }
    };

    const handleRecommend = async (hotelId: string) => {
        if (!trip) return;

        console.log('🎯 Current trip state:', {
            tripId: trip.id,
            currentStatus: trip.status,
            currentApprovedHotelId: trip.approved_hotel_id,
            attemptingToRecommend: hotelId
        });

        if (confirm("Are you sure you want to recommend this hotel to the customer?")) {
            const res = await rfqService.recommendHotel(trip.id, hotelId);
            if (res.success) {
                console.log('✅ Recommendation successful, reloading data...');
                alert("Hotel recommended successfully!");
                loadData(trip.id); // Refresh
            } else {
                console.error('❌ Recommendation failed:', res.error);
                alert("Failed to recommend: " + res.error);
            }
        }
    };

    const handleSendAllRFQs = async (hotels: Hotel[]) => {
        if (!trip) return;
        const hotelsToSend = hotels.filter(h => !requests.some(r => r.hotel_id === h.id));
        if (hotelsToSend.length === 0) {
            alert("RFQs already sent to all these hotels.");
            return;
        }

        if (!confirm(`Send RFQ to ${hotelsToSend.length} hotels?`)) return;

        // processing
        for (const hotel of hotelsToSend) {
            await rfqService.createHotelRequest(trip.id, hotel.id);
        }
        loadData(trip.id);
    };

    // Currency utility
    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return '-';
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    if (loading) return <div>Loading details...</div>;
    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{trip.destination}</h1>
                    <p className="text-lg text-gray-500 mt-1">Customer: {trip.user_id ? "Authenticated" : "Guest"}</p>
                </div>
                <StatusBadge status={trip.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-semibold mb-4 text-lg">Requirements</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block">Dates</span>
                            <span className="font-medium">{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'} - {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Travelers</span>
                            <span className="font-medium">{trip.travelers} People</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Budget</span>
                            <span className="font-medium">{formatCurrency(trip.budget)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Preferences</span>
                            <span className="font-medium">{trip.form_data?.accommodationPreferences?.join(', ') || 'None'}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <span className="text-gray-500 block text-sm">Description</span>
                        <p className="text-gray-700 mt-1">{trip.description || trip.form_data?.description || 'No notes.'}</p>
                    </div>
                </Card>
            </div>

            {/* Quote Comparison Table */}
            {requests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">RFQ Status & Quote Comparison</h2>
                    <p className="text-sm text-gray-500">Total RFQs sent: {requests.length} | Quoted: {requests.filter(r => r.status === 'quoted').length}</p>
                    <Card className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs border-b">
                                <tr>
                                    <th className="px-6 py-3">Hotel</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Room Cost</th>
                                    <th className="px-6 py-3">F&B</th>
                                    <th className="px-6 py-3">Other</th>
                                    <th className="px-6 py-3 font-bold bg-blue-50">Final Price</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map(req => {
                                    const isRecommended = trip.approved_hotel_id === req.hotel_id && trip.status === 'recommended';
                                    const isAccepted = trip.approved_hotel_id === req.hotel_id && trip.status === 'accepted';
                                    const isRejected = (trip.approved_hotel_id === req.hotel_id && trip.status === 'rejected') ||
                                        (trip.rejected_hotel_ids?.includes(req.hotel_id)) ||
                                        (trip.rejectedHotelIds?.includes(req.hotel_id));

                                    return (
                                        <>
                                            <tr key={req.id} className={`hover:bg-gray-50 ${isRecommended ? 'bg-green-50' : ''} ${isAccepted ? 'bg-blue-50' : ''} ${isRejected ? 'bg-red-50' : ''}`}>
                                                <td className="px-6 py-4 font-medium flex items-center gap-2">
                                                    {req.hotel?.name || 'Unknown Hotel'}
                                                    {isRecommended && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 uppercase font-bold">Recommended</span>}
                                                    {isAccepted && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 uppercase font-bold">Accepted</span>}
                                                    {isRejected && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 uppercase font-bold">Rejected</span>}
                                                </td>
                                                <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {req.status === 'quoted' ? formatCurrency(req.room_cost || req.quote_details?.roomCost) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {req.status === 'quoted' ? formatCurrency(req.food_cost || req.quote_details?.foodCost) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {req.status === 'quoted' ? formatCurrency((req.conference_cost || req.quote_details?.conferenceCost || 0) + (req.transport_cost || req.quote_details?.transportCost || 0) + (req.extra_charges || req.quote_details?.extraCharges || 0)) : '-'}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-blue-700 bg-blue-50/30">
                                                    {req.status === 'quoted' ? formatCurrency(req.final_base_price || req.quote_details?.finalBasePrice) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {req.status === 'quoted' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setExpandedQuote(expandedQuote === req.id ? null : req.id)}
                                                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                            >
                                                                {expandedQuote === req.id ? 'Hide Details' : 'View Details'}
                                                            </Button>
                                                        )}
                                                        {/* Show Accept & Recommend if hotel is not currently recommended, accepted, or rejected, AND trip is not already accepted */}
                                                        {(req.status as string) === 'quoted' && trip.status !== 'accepted' && !isRecommended && !isRejected && (
                                                            <Button size="sm" onClick={() => handleRecommend(req.hotel_id)} className="bg-green-600 hover:bg-green-700">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Accept & Recommend
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedQuote === req.id && req.status === 'quoted' && (
                                                <tr className="bg-blue-50/30">
                                                    <td colSpan={7} className="px-6 py-4">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-500 block">Room Cost</span>
                                                                <span className="font-semibold">{formatCurrency(req.room_cost || req.quote_details?.roomCost)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Food & Beverage</span>
                                                                <span className="font-semibold">{formatCurrency(req.food_cost || req.quote_details?.foodCost)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Conference/Hall</span>
                                                                <span className="font-semibold">{formatCurrency(req.conference_cost || req.quote_details?.conferenceCost)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Transport</span>
                                                                <span className="font-semibold">{formatCurrency(req.transport_cost || req.quote_details?.transportCost)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Taxes & Fees</span>
                                                                <span className="font-semibold">{formatCurrency(req.taxes || req.quote_details?.taxes)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Service Charges</span>
                                                                <span className="font-semibold">{formatCurrency(req.service_charges || req.quote_details?.serviceCharges)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Extra Charges</span>
                                                                <span className="font-semibold">{formatCurrency(req.extra_charges || req.quote_details?.extraCharges)}</span>
                                                            </div>
                                                            <div className="bg-green-50 p-2 rounded border border-green-200">
                                                                <span className="text-green-700 block">Discount</span>
                                                                <span className="font-semibold text-green-700">-{formatCurrency(req.discount_amount || req.quote_details?.discountOffered)}</span>
                                                            </div>
                                                            <div className="col-span-2 md:col-span-4 border-t pt-3 mt-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-gray-700 font-medium">Subtotal:</span>
                                                                    <span className="font-semibold">{formatCurrency(req.base_price || req.quote_details?.basePrice)}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-2">
                                                                    <span className="text-lg font-bold text-blue-700">Final Quote Price:</span>
                                                                    <span className="text-2xl font-bold text-blue-700">{formatCurrency(req.final_base_price || req.quote_details?.finalBasePrice)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {/* System Recommendations */}
            {trip.recommended_hotels && trip.recommended_hotels.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-purple-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>✨ System Recommendations</span>
                            <span className="text-sm font-normal text-gray-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                Based on customer preferences
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                            onClick={() => handleSendAllRFQs(trip.recommended_hotels)}
                        >
                            Send RFQ to All ({trip.recommended_hotels.length})
                        </Button>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trip.recommended_hotels.map((hotel: Hotel) => {
                            const hasSentRFQ = requests.some(r => r.hotel_id === hotel.id);
                            return (
                                <Card key={hotel.id} className="p-4 border-2 border-purple-100 bg-purple-50/10 hover:shadow-md transition-shadow relative">
                                    <div className="absolute top-2 right-2 z-10">
                                        <span className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
                                            Match
                                        </span>
                                    </div>
                                    <div className="aspect-video bg-gray-200 rounded mb-3 overflow-hidden text-center flex items-center justify-center">
                                        {hotel.images && hotel.images.length > 0 ?
                                            <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                                            : hotel.image_url ?
                                                <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                                                : <span className="text-gray-400 text-xs">No Image</span>
                                        }
                                    </div>
                                    <h4 className="font-semibold truncate text-purple-900">{hotel.name}</h4>
                                    {hotel.brand && <p className="text-xs text-purple-600 font-medium mb-1">{hotel.brand}</p>}
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                        {hotel.rating} stars • {hotel.location || hotel.city}
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            className="w-full items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                                            disabled={hasSentRFQ}
                                            onClick={() => handleSendRFQ(hotel)}
                                        >
                                            <Send className="w-3 h-4" />
                                            {hasSentRFQ ? 'RFQ Sent' : 'Send RFQ'}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Hotel Selection (Send RFQ) */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    All Hotel Partners
                    <span className="text-sm font-normal text-gray-500">
                        ({allHotels.length})
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {allHotels.length === 0 ? (
                        <div className="col-span-3 text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                            No active hotel partners found in the system.
                        </div>
                    ) : (
                        allHotels.map((hotel: Hotel) => {
                            const hasSentRFQ = requests.some(r => r.hotel_id === hotel.id);
                            return (
                                <Card key={hotel.id} className="p-4 border hover:shadow-md transition-shadow">
                                    <div className="aspect-video bg-gray-200 rounded mb-3 overflow-hidden text-center flex items-center justify-center">
                                        {hotel.image_url ?
                                            <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                                            : <span className="text-gray-400 text-xs">No Image</span>
                                        }
                                    </div>
                                    <h4 className="font-semibold truncate">{hotel.name}</h4>
                                    {hotel.brand && <p className="text-xs text-blue-600 font-medium mb-1">{hotel.brand}</p>}
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                        {hotel.rating} stars • {hotel.city}
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            className="w-full items-center gap-2"
                                            disabled={hasSentRFQ}
                                            onClick={() => handleSendRFQ(hotel)}
                                        >
                                            <Send className="w-3 h-4" />
                                            {hasSentRFQ ? 'RFQ Sent' : 'Send RFQ'}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        }))}
                </div>
            </div>
        </div>
    );
}
