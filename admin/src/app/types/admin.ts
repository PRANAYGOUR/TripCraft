// Core types for the admin application

export type TripStatus = 'pending' | 'recommended' | 'accepted' | 'rejected';

export interface Customer {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
}

export interface Trip {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  contactNumber: string;

  // Basic Details
  destination: string;
  preferredCities: string[];
  eventPurpose: string;
  numberOfPeople: number;
  duration: number;
  checkInDate: string;
  checkOutDate: string;

  // Accommodation Preferences
  locationsNearby: string[];
  stayType: string;
  starCategory: string;
  roomRequirements: {
    single: number;
    double: number;
    triple: number;
    quad: number;
  };

  // Event Requirements
  eventHallRequired: boolean;
  hallSetupPreferences?: string[];
  audioVisualRequirements?: string[];
  eventServices?: string[];

  // Meals & Refreshments
  meals: string[];
  mealType?: string;
  serviceStyle?: string;

  // Status & Workflow
  status: TripStatus;
  submittedDate: string;
  // Optional description / notes (admin or rejection reason)
  description?: string;
  recommendedHotelId?: string;
  rejectedHotelIds?: string[];
  acceptedHotelId?: string;

  // Additional fields for compatibility
  recommended_hotels?: any[];
  created_at?: string;
  start_date?: string;
  budget?: number;
  travelers?: number;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  starRating: number;
  amenities: string[];
  locationType: string[]; // beach, city, nature, etc.
  totalRooms: number;
  roomTypes: {
    single: number;
    double: number;
    triple: number;
    quad: number;
  };
  eventHallAvailable: boolean;
  hallCapacity?: number;
  audioVisualEquipment?: string[];
  mealOptions: string[];
  priceRange: string; // budget, moderate, luxury
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin';
}

export interface RecommendedHotel extends Hotel {
  matchReason: string;
  matchScore: number;
}
