import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import { OverviewPage } from '../components/OverviewPage';
import { Trip } from '../types/admin';

export function AdminDashboard() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTrips = async () => {
        setLoading(true);
        try {
            const result = await tripService.getAllTrips();
            if (result.success) {
                setTrips(result.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrips();
    }, []);

    const navigate = useNavigate();

    const handleViewTrip = (tripId: string) => {
        navigate(`/admin-trips/${tripId}`);
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading Admin Dashboard...</div>;
    }

    return (
        <OverviewPage
            trips={trips}
            onViewTrip={handleViewTrip}
            onRefreshTrips={loadTrips}
        />
    );
}
