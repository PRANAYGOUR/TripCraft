/**
 * TRIP SERVICE
 * CRUD operations for trips
 * Handles database interactions with proper access control
 */

import { supabase } from './supabaseClient';
import { authService } from './auth.service';
import { hotelRecommendationService } from './hotelRecommendation.service';
import {
  Trip,
  CustomerFormData,
  ApiResponse,
  Hotel,
  TripStatus,
  User,
} from '../types/shared.types';
import { differenceInCalendarDays } from 'date-fns';

class TripService {
  /**
   * CREATE TRIP - Called when customer submits form
   *
   * 1. Save form_data
   * 2. Generate system_recommendations
   * 3. Set status = "pending"
   * 4. Return created trip
   */
  async createTrip(formData: CustomerFormData): Promise<ApiResponse<Trip>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Generate recommendations
      const recommendations = await hotelRecommendationService.generateRecommendations(
        formData
      );

      if (recommendations.length === 0) {
        return { success: false, error: 'Could not generate hotel recommendations' };
      }

      // Compute duration (days) from dates when available
      let duration = 0;
      try {
        if (formData.startDate && formData.endDate) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          duration = Math.max(1, differenceInCalendarDays(end, start));
        }
      } catch (e) {
        duration = 0;
      }

      // Create trip record
      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            customer_id: currentUser.id,
            destination: formData.destination,
            start_date: formData.startDate,
            end_date: formData.endDate,
            duration,
            budget: formData.budget,
            travelers: formData.travelers,
            travel_style: formData.travelStyle,
            dietary_restrictions: formData.dietaryRestrictions || [],
            accommodation_preferences: formData.accommodationPreferences || [],
            status: 'pending',
            form_data: formData,
            description: formData.description || null,
            // Store full hotel objects so UI can show images and details later
            recommended_hotels: recommendations.map(h => ({
              id: h.id,
              name: h.name,
              location: h.location || h.city || null,
              rating: h.rating || h.star_rating || null,
              price_per_night: h.price_per_night || null,
              amenities: h.amenities || [],
              images: h.images || (h.image_url ? [h.image_url] : []),
              image_url: h.image_url || null,
              description: h.description || null,
              brand: h.brand || null,
            })),
          },
        ])
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'Failed to create trip',
        };
      }

      return {
        success: true,
        data: data as Trip,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create trip',
      };
    }
  }

  /**
   * GET CUSTOMER'S TRIPS
   * Returns ONLY trips belonging to current customer
   */
  async getCustomerTrips(): Promise<ApiResponse<Trip[]>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('customer_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: (data || []) as Trip[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
      };
    }
  }

  /**
   * GET ADMIN'S TRIPS
   * Returns ALL trips (admin access)
   */
  async getAllTrips(): Promise<ApiResponse<Trip[]>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: (data || []) as Trip[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
      };
    }
  }

  /**
   * GET TRIPS BY STATUS
   * Admin view: see pending, recommended, accepted, rejected trips
   */
  async getTripsByStatus(status: TripStatus): Promise<ApiResponse<Trip[]>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: (data || []) as Trip[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
      };
    }
  }

  /**
   * GET SINGLE TRIP
   * Check access: customer can only see own, admin can see all
   */
  async getTrip(tripId: string): Promise<ApiResponse<Trip>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error || !trip) {
        return { success: false, error: 'Trip not found' };
      }

      // Access control: customer can only see own trips
      if (
        currentUser.role === 'customer' &&
        trip.customer_id !== currentUser.id
      ) {
        return { success: false, error: 'Access denied' };
      }

      return {
        success: true,
        data: trip as Trip,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trip',
      };
    }
  }

  /**
   * ADMIN: SELECT HOTEL & APPROVE RECOMMENDATION
   * 1. Verify hotel is in system_recommendations
   * 2. Save approved_hotel_id
   * 3. Set status = "recommended"
   */
  async approveHotel(tripId: string, hotelId: string): Promise<ApiResponse<Trip>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      // Get current trip
      const { data: trip, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (fetchError || !trip) {
        return { success: false, error: 'Trip not found' };
      }

      // Check if trip is already accepted
      if (trip.status === 'accepted') {
        return { success: false, error: 'Cannot modify accepted trips' };
      }

      // Verify hotel is in recommendations
      const recommendationIds = trip.recommended_hotels?.map(
        (h: any) => h.id
      ) || [];
      if (!recommendationIds.includes(hotelId)) {
        return { success: false, error: 'Hotel not in system recommendations' };
      }

      // Update trip
      const { data, error } = await supabase
        .from('trips')
        .update({
          approved_hotel_id: hotelId,
          status: 'recommended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'Failed to approve hotel',
        };
      }

      return {
        success: true,
        data: data as Trip,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve hotel',
      };
    }
  }

  /**
   * CUSTOMER: ACCEPT RECOMMENDATION
   * status: "recommended" → "accepted"
   */
  async acceptRecommendation(tripId: string): Promise<ApiResponse<Trip>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get trip
      const { data: trip, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (fetchError || !trip) {
        return { success: false, error: 'Trip not found' };
      }

      // Access control
      if (trip.customer_id !== currentUser.id) {
        return { success: false, error: 'Access denied' };
      }

      // Can only accept if status is "recommended"
      if (trip.status !== 'recommended') {
        return {
          success: false,
          error: 'Trip must be in "recommended" status to accept',
        };
      }

      // Update status
      const { data, error } = await supabase
        .from('trips')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'Failed to accept recommendation',
        };
      }

      return {
        success: true,
        data: data as Trip,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept',
      };
    }
  }

  /**
   * CUSTOMER: REJECT RECOMMENDATION
   * status: "recommended" → "rejected"
   */
  async rejectRecommendation(tripId: string, note: string = ''): Promise<ApiResponse<Trip>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get trip
      const { data: trip, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (fetchError || !trip) {
        return { success: false, error: 'Trip not found' };
      }

      // Access control
      if (trip.customer_id !== currentUser.id) {
        return { success: false, error: 'Access denied' };
      }

      // Can only reject if status is "recommended"
      if (trip.status !== 'recommended') {
        return {
          success: false,
          error: 'Trip must be in "recommended" status to reject',
        };
      }

      // Update status and store rejection note
      const { data, error } = await supabase
        .from('trips')
        .update({
          status: 'rejected',
          description: note || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'Failed to reject recommendation',
        };
      }

      return {
        success: true,
        data: data as Trip,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject',
      };
    }
  }

  /**
   * ADMIN: REGENERATE RECOMMENDATIONS FOR REJECTED TRIP
   * Useful when customer rejects and admin wants fresh options
   */
  async regenerateRecommendations(tripId: string): Promise<ApiResponse<Trip>> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      // Get trip
      const { data: trip, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (fetchError || !trip) {
        return { success: false, error: 'Trip not found' };
      }

      // Generate fresh recommendations
      const newRecommendations = await hotelRecommendationService.generateRecommendations(
        trip.form_data
      );

      if (newRecommendations.length === 0) {
        return { success: false, error: 'Could not generate new recommendations' };
      }

      console.log('🏨 Generated new recommendations:', newRecommendations.map(h => h.name));

      // Update trip with new recommendations
      // Auto-approve the first new hotel so customer sees it immediately
      const { data, error } = await supabase
        .from('trips')
        .update({
          recommended_hotels: newRecommendations.map(h => ({
            id: h.id,
            name: h.name,
            location: h.location || h.city || null,
            rating: h.rating || h.star_rating || null,
            price_per_night: h.price_per_night || null,
            amenities: h.amenities || [],
            images: h.images || (h.image_url ? [h.image_url] : []),
            image_url: h.image_url || null,
            description: h.description || null,
            brand: h.brand || null,
          })),
          approved_hotel_id: newRecommendations[0]?.id, // Auto-approve first new hotel
          description: null,
          status: 'recommended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'Failed to regenerate recommendations',
        };
      }

      console.log('✅ Trip updated. New approved hotel:', newRecommendations[0]?.name);

      return {
        success: true,
        data: data as Trip,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to regenerate recommendations',
      };
    }
  }
}

export const tripService = new TripService();
