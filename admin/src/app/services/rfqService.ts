import { supabase } from './supabaseClient';
import { authService } from './auth.service';
import { HotelRequest, StructuredQuote, ApiResponse } from '../types/shared.types';

class RFQService {
    /**
     * CREATE RFQ (Admin Action)
     */
    async createHotelRequest(tripId: string, hotelId: string): Promise<ApiResponse<HotelRequest>> {
        try {
            const { data, error } = await supabase
                .from('hotel_requests')
                .insert({
                    trip_id: tripId,
                    hotel_id: hotelId,
                    status: 'pending',
                    availability_status: 'pending', // Strict requirement
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) return { success: false, error: error.message };
            return { success: true, data: data as HotelRequest };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    /**
     * GET REQUESTS FOR HOTEL USER (Strict Filter)
     * Filters by hotels.user_id matching current user
     */
    async getRequestsForHotelUser(): Promise<ApiResponse<HotelRequest[]>> {
        try {
            const user = await authService.getCurrentUser();
            if (!user) return { success: false, error: 'Unauthorized: No user found' };

            // Core requirement: Filter by hotels.user_id = user.id
            const { data, error } = await supabase
                .from('hotel_requests')
                .select(`
                    *,
                    hotels!inner (
                        id,
                        name,
                        brand,
                        user_id
                    ),
                    trips (
                        id,
                        destination,
                        start_date,
                        end_date,
                        travelers,
                        budget
                    )
                `)
                .eq('hotels.user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) return { success: false, error: error.message };
            return { success: true, data: data as HotelRequest[] };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    /**
     * GET SINGLE REQUEST DETAIL
     */
    async getRequestById(id: string): Promise<ApiResponse<HotelRequest>> {
        try {
            const { data, error } = await supabase
                .from('hotel_requests')
                .select(`
          *,
          trip:trip_id (*),
          hotel:hotel_id (*)
        `)
                .eq('id', id)
                .single();

            if (error) return { success: false, error: error.message };
            return { success: true, data: data as HotelRequest };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    /**
     * GET ALL REQUESTS FOR A TRIP (Admin View)
     */
    async getTripRequests(tripId: string): Promise<ApiResponse<HotelRequest[]>> {
        try {
            const { data, error } = await supabase
                .from('hotel_requests')
                .select(`
          *,
          hotel:hotel_id (name, rating, brand) 
        `)
                .eq('trip_id', tripId)
                .order('created_at', { ascending: false });

            console.log('getTripRequests - Raw data:', data);
            console.log('getTripRequests - Error:', error);

            if (error) return { success: false, error: error.message };
            return { success: true, data: data as HotelRequest[] };
        } catch (e: any) {
            console.error('getTripRequests - Exception:', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * SUBMIT QUOTE (Hotel Action)
     */
    async submitQuote(requestId: string, details: StructuredQuote): Promise<ApiResponse<HotelRequest>> {
        try {
            // Use RPC to bypass REST API schema caching/RLS complexity issues
            const { data, error } = await supabase.rpc('submit_hotel_quote', {
                p_request_id: requestId,
                p_room_cost: details.roomCost,
                p_food_cost: details.foodCost,
                p_conference_cost: details.conferenceCost,
                p_transport_cost: details.transportCost,
                p_taxes: details.taxes,
                p_service_charges: details.serviceCharges,
                p_extra_charges: details.extraCharges,
                p_discount_amount: details.discountOffered,
                p_base_price: details.basePrice,
                p_final_base_price: details.finalBasePrice,
                p_quote_details: details
            });

            if (error) return { success: false, error: error.message };
            // The RPC returns the updated row as JSONB
            return { success: true, data: data as any as HotelRequest };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    /**
     * ACCEPT & RECOMMEND (Admin Action)
     */
    async recommendHotel(tripId: string, hotelId: string): Promise<ApiResponse<void>> {
        try {
            console.log('🔄 Recommending hotel:', { tripId, hotelId });

            const { data, error } = await supabase
                .from('trips')
                .update({
                    approved_hotel_id: hotelId,
                    status: 'recommended'
                })
                .eq('id', tripId)
                .select();

            if (error) {
                console.error('❌ Failed to recommend hotel:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Hotel recommended successfully:', data);
            return { success: true };
        } catch (e: any) {
            console.error('❌ Exception in recommendHotel:', e);
            return { success: false, error: e.message };
        }
    }

    async getAvailableHotels(): Promise<ApiResponse<any[]>> {
        try {
            const { data, error } = await supabase.from('hotels').select('*').limit(50);
            if (error) return { success: false, error: error.message };
            return { success: true, data: data };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
}

export const rfqService = new RFQService();
