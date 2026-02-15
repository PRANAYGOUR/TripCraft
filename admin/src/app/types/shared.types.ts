/**
 * SHARED DATA MODELS - Single Source of Truth
 * Used by both Customer and Admin apps
 */

export type TripStatus = 'pending' | 'recommended' | 'accepted' | 'rejected';
export type HotelRequestStatus = 'pending' | 'quoted' | 'selected' | 'rejected' | 'accepted' | 'missed' | 'expired';
export type UserRole = 'customer' | 'admin' | 'hotel_partner';

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
  brand?: string; // Added brand
  user_id?: string; // Added user_id for strict filtering
  location: string;
  city: string;
  star_rating: number;
  rating?: number; // Added for compatibility
  image_url?: string; // Added for compatibility
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

  // Enterprise Fields
  performance_score?: number;
  total_completed_bookings?: number;
  avg_response_time_hours?: number;
  negotiation_success_rate?: number;
  priority_partner?: boolean;
  corporate_discount_percentage?: number;
  commission_percentage?: number;
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
  dietaryRestrictions?: string[]; // Added
  accommodationPreferences?: string[]; // Added
  // Optional trip-level description / notes (admin or customer rejection reason)
  description?: string;
}

// ============= TRIP (SINGLE SOURCE OF TRUTH) =============
export interface Trip {
  id: string;
  user_id: string;
  status: TripStatus;

  // Key Trip Fields (mirrored from DB for easy access)
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  travelers: number;

  // Customer Form (stored as-is, no modifications)
  form_data: CustomerFormData;

  // System-generated recommendations (2-3 hotels)
  recommended_hotels: Hotel[];

  // Admin Selection
  approved_hotel_id?: string;
  approved_hotel?: Hotel; // Optional full object for UI convenience
  rejected_hotel_ids?: string[]; // Added for tracking multiple rejections
  rejectedHotelIds?: string[]; // Keeping for compatibility with any existing frontend code


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

// ============= NEW ENTERPRISE TYPES =============

export interface StructuredQuote {
  roomCost: number;
  foodCost: number;
  conferenceCost: number;
  transportCost: number;
  taxes: number;
  serviceCharges: number;
  extraCharges: number;
  discountOffered: number;
  // Computed (handled by frontend logic usually, but good to store if needed)
  basePrice: number;
  finalBasePrice: number;
}

export interface HotelRequest {
  id: string;
  trip_id: string;
  hotel_id: string;
  status: HotelRequestStatus;
  availability_status: 'pending' | 'fully_available' | 'partially_available' | 'not_available' | 'quoted' | 'expired';
  negotiation_status: 'open' | 'counter_requested' | 'closed' | 'accepted';
  round_number: number;
  system_score: number;
  deadline: string;

  // Cost fields (stored directly in DB)
  room_cost?: number;
  food_cost?: number;
  conference_cost?: number;
  transport_cost?: number;
  taxes?: number;
  service_charges?: number;
  extra_charges?: number;
  discount_amount?: number;
  base_price?: number;
  final_base_price?: number;

  quote_details?: StructuredQuote;
  admin_notes?: string;
  created_at: string;
  updated_at: string;

  // Joined Data (for UI)
  hotel?: Hotel;
  trip?: Trip;
}

export interface HotelNegotiation {
  id: string;
  hotel_request_id: string;
  sender_role: 'admin' | 'hotel_partner';
  message: string;
  round_number: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  recipient_role?: UserRole;
  message: string;
  read_status: boolean;
  metadata?: any;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by?: string;
  details?: any;
  created_at: string;
}

// ============= STATUS DEFINITIONS =============
/*
STATUS WORKFLOW (UPDATED):

pending
  ↓
  └─→ (System scores & Admin sends RFQ) → hotels_contacted
       ↓
       ├─→ (Hotel responds with quote) → responded
       │    ↓
       │    └─→ (Admin negotiates) → negotiation_open
       │         ↓
       │         └─→ (Admin selects Best Value) → recommended
       │
       └─→ (Hotel rejects/expires) → rejected/expired

PERMISSIONS:
- Customer: View own trips, accept/reject recommendations.
- Admin: View all, manage RFQs, negotiations, analytics.
- Hotel Partner: View assigned RFQs, submit quotes, chat with admin.
*/
