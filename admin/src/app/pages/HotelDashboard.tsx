import { useEffect, useState } from 'react';
import { rfqService } from '../services/rfqService';
import { HotelRequest } from '../types/shared.types';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HotelDashboard() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<HotelRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Strict fetch by hotel user ID
        rfqService.getRequestsForHotelUser().then((res) => {
            if (res.success && res.data) {
                setRequests(res.data);
            } else {
                console.warn('Failed to fetch requests:', res.error);
                setError(res.error || 'Failed to load requests');
            }
            setLoading(false);
        });
    }, []);

    const handleView = (id: string) => {
        navigate(`/hotel-rfq/${id}`);
    };

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return 'N/A';
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    if (loading) return <div className="p-8">Loading your requests...</div>;

    if (error) return (
        <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="text-red-600 mb-2 font-bold text-xl">Access Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-white shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Active RFQs</p>
                            <p className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-white shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Submitted Quotes</p>
                            <p className="text-2xl font-bold">{requests.filter(r => r.status === 'quoted').length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-white shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Selected</p>
                            <p className="text-2xl font-bold">{requests.filter(r => r.status === 'selected').length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Requests List */}
            <Card className="overflow-hidden border border-slate-200 shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium text-slate-700">
                    Recent Opportunities
                </div>

                {requests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No active requests found.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {requests.map((req) => (
                            <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                        {req.trip?.destination?.substring(0, 2).toUpperCase() || 'TR'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{req.trip?.destination || 'New Trip Request'}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {req.trip?.start_date ? new Date(req.trip.start_date).toLocaleDateString() : 'TBD'}
                                                {' - '}
                                                {req.trip?.end_date ? new Date(req.trip.end_date).toLocaleDateString() : 'TBD'}
                                            </span>
                                            <span>•</span>
                                            <span>{req.trip?.travelers || 0} Travelers</span>
                                            <span>•</span>
                                            <span>Budget: {formatCurrency(req.trip?.budget)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Status</p>
                                        <StatusBadge status={req.status} />
                                    </div>

                                    <Button
                                        onClick={() => handleView(req.id)}
                                        className="bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                        {req.status === 'pending' ? 'View & Quote' : 'View Details'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
