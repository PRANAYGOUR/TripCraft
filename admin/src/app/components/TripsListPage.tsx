import { useState, useMemo } from 'react';
import { Trip, TripStatus } from '../types/shared.types';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { StatusBadge } from './StatusBadge';
import { Search, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface TripsListPageProps {
  filterStatus?: TripStatus;
  onViewTrip: (tripId: string) => void;
  trips: Trip[];
}

export function TripsListPage({ filterStatus, onViewTrip, trips }: TripsListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const pageTitle = filterStatus 
    ? `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Trips`
    : 'All Trips';

  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Filter by status if specified
    if (filterStatus) {
      result = result.filter(trip => trip.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip => 
        trip.customer_name.toLowerCase().includes(query) ||
        trip.customer_email.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        trip.id.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'date') {
      result.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === 'status') {
      const statusOrder = { pending: 0, recommended: 1, rejected: 2, accepted: 3 };
      result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }

    return result;
  }, [filterStatus, searchQuery, sortBy, trips]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">{pageTitle}</h1>
        <p className="text-muted-foreground">
          {filteredAndSortedTrips.length} {filteredAndSortedTrips.length === 1 ? 'trip' : 'trips'} found
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, email, destination, or trip ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              onClick={() => setSortBy('date')}
            >
              Sort by Date
            </Button>
            <Button
              variant={sortBy === 'status' ? 'default' : 'outline'}
              onClick={() => setSortBy('status')}
            >
              Sort by Status
            </Button>
          </div>
        </div>
      </Card>

      {/* Trips Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>People</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No trips found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTrips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">{trip.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{trip.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{trip.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{trip.event_purpose}</TableCell>
                    <TableCell>{trip.number_of_people}</TableCell>
                    <TableCell>{formatDate(trip.check_in_date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={trip.status} />
                    </TableCell>
                    <TableCell>{formatDate(trip.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewTrip(trip.id)}
                      >
                        <Eye className="size-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}