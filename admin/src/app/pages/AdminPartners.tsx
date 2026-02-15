import { useState, useEffect } from 'react';
import { rfqService } from '../services/rfqService';
import { Hotel } from '../types/shared.types';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Building2, Search, MapPin, Star, MoreVertical, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../utils/formatter';

export function AdminPartners() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadHotels();
    }, []);

    const loadHotels = async () => {
        const res = await rfqService.getAvailableHotels();
        if (res.success && res.data) {
            setHotels(res.data);
        }
        setLoading(false);
    };

    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading partners...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hotel Partners</h1>
                    <p className="text-gray-500">Manage your enterprise supplier network</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Building2 className="w-4 h-4 mr-2" />
                    Add New Partner
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <p className="text-sm font-medium text-gray-500 uppercase">Total Partners</p>
                    <p className="text-3xl font-bold text-blue-600">{hotels.length}</p>
                    <div className="mt-2 text-xs text-green-600 font-medium">↑ 12% from last month</div>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-gray-500 uppercase">Avg Performance</p>
                    <p className="text-3xl font-bold text-orange-600">4.8</p>
                    <div className="mt-2 text-xs text-gray-500">Based on 145 completed bookings</div>
                </Card>
                <Card className="p-6">
                    <p className="text-sm font-medium text-gray-500 uppercase">Active Negotiations</p>
                    <p className="text-3xl font-bold text-purple-600">24</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium font-medium cursor-pointer">View all messages →</div>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by hotel name or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm">
                    <option>All Locations</option>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Goa</option>
                </select>
                <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm">
                    <option>All Ratings</option>
                    <option>5 Star</option>
                    <option>4 Star</option>
                </select>
            </div>

            {/* Partners Table */}
            <Card className="overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Hotel Profile</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Metrics</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredHotels.map(hotel => (
                            <tr key={hotel.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                            {hotel.image_url ? (
                                                <img src={hotel.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : hotel.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{hotel.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{hotel.brand || 'Independent'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {hotel.city}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                            <span className="font-medium text-gray-900">{hotel.star_rating}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Negotiation Success: 92%</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${hotel.priority_partner ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {hotel.priority_partner ? 'Priority' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" className="text-blue-600 h-8 px-2">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 px-2">
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredHotels.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No partners found matching your search.
                    </div>
                )}
            </Card>
        </div>
    );
}
