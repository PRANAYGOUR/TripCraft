import { TripStatus } from '../types/admin';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'recommended':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'responded': // Hotel responded
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'accepted':
      case 'selected': // For HotelRequest
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'negotiating':
      case 'counter_requested':
      case 'open':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm rounded-full border ${getStatusStyles()}`}
    >
      {getStatusLabel()}
    </span>
  );
}