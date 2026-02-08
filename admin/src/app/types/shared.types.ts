/**
 * SHARED DATA MODELS - Single Source of Truth
 * Used by both Customer and Admin apps
 */

export type TripStatus = 'pending' | 'recommended' | 'accepted' | 'rejected';
export type UserRole = 'customer' | 'admin';

// ============= USER =============
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; // 'customer' or 'admin'
  created_at: string;
}

// ============= HOTEL =============
export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  star_rating: number;
  amenities: string[];
  location_type: string[]; // beach, city, nature, business, resort
  total_rooms: number;
  room_types: {
    single: number;
    double: number;
    triple: number;
    quad: number;
  };
  event_hall_available: boolean;
  hall_capacity?: number;
  audio_visual_equipment?: string[];
  meal_options: string[];
  price_range: 'budget' | 'moderate' | 'luxury';
  images?: string[]; // Array of image URLs (4-5 images)
  description?: string; // Hotel description
  price_per_night?: number; // Price per night
  created_at?: string;
}

// ============= CUSTOMER FORM DATA (Unchanged) =============
export interface CustomerFormData {
  // Page 1
  email: string;
  name: string;
  contact: string;
  location: string;

  // Page 2
  eventPurpose: string;
  preferredCities: string;
  locationsNearby: string[];
  stayType: string[];
  starCategory: string[];
  numberOfPeople: number;
  duration: number;
  singleRooms: number;
  doubleRooms: number;
  tripleRooms: number;
  quadRooms: number;
  checkIn: string | null; // ISO date string
  checkOut: string | null; // ISO date string
  requiresEventHall: boolean;
  hallSetup: string[];
  avRequirements: string[];
  eventServices: string[];
  meals: string[];
  mealType: string[];
  serviceStyle: string[];
  // Optional trip-level description / notes (admin or customer rejection reason)
  description?: string;
}

// ============= TRIP (SINGLE SOURCE OF TRUTH) =============
export interface Trip {
  id: string;
  user_id: string;
  status: TripStatus;

  // Customer Form (stored as-is, no modifications)
  form_data: CustomerFormData;

  // System-generated recommendations (2-3 hotels)
  system_recommendations: Hotel[];

  // Admin Selection
  approved_hotel_id?: string;
  approved_hotel?: Hotel; // Optional full object for UI convenience

  // Metadata
  created_at: string;
  updated_at: string;
  // Optional description / notes associated with this trip
  description?: string;
}

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

// ============= STATUS DEFINITIONS =============
/*
STATUS WORKFLOW:

pending
  ↓
  └─→ (Admin reviews, selects hotel) → recommended
       ↓
       ├─→ (Customer accepts) → accepted (FINAL - read-only)
       │
       └─→ (Customer rejects) → rejected
            ↓
            └─→ (Admin selects different hotel) → recommended (retry)

PERMISSIONS:
- Customer:
  - Can view ONLY their own trips
  - Can update status from "recommended" to "accepted" or "rejected"
  
- Admin:
  - Can view ALL trips
  - Can update approved_hotel when status is "pending" or "recommended"
  - Cannot modify trips with status = "accepted"

BUSINESS RULES:
- Only system recommendations can be approved (rule-based matching)
- Once accepted, trip becomes read-only for both parties
- If rejected, admin must select from system_recommendations or trigger regeneration
*/
