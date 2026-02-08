/**
 * HOTEL RECOMMENDATION ENGINE
 * Rule-based matching system (NO AI/ML)
 * Generates 2-3 hotels based on trip requirements
 */

import { supabase } from './supabaseClient';
import { CustomerFormData, Hotel } from '../types/shared.types';

interface RecommendationScore {
  hotel: Hotel;
  score: number;
  reasons: string[];
}

class HotelRecommendationService {
  /**
   * MAIN: Generate 2-3 hotel recommendations
   * Enhanced with slight randomization (±5%) so similar trips don't always see exact same hotels
   */
  async generateRecommendations(formData: CustomerFormData): Promise<Hotel[]> {
    try {
      // Fetch all hotels from database
      const { data: hotels, error } = await supabase
        .from('hotels')
        .select('*');

      if (error || !hotels) {
        console.error('Error fetching hotels:', error);
        return [];
      }

      // Score each hotel
      const scoredHotels = hotels.map((hotel) =>
        this.scoreHotel(hotel, formData)
      ) as RecommendationScore[];

      // Add slight randomization (±5%) to scores to vary recommendations for similar trips
      const scoredWithVariance = scoredHotels.map(item => ({
        ...item,
        score: item.score * (0.95 + Math.random() * 0.1) // ±5% variance
      }));

      // Sort by score and return top 3
      const recommended = scoredWithVariance
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((h) => h.hotel);

      return recommended;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * SCORING LOGIC - SAFE VERSION
   * Works with actual hotel schema: id, name, location, rating, price_per_night, amenities
   */
  private scoreHotel(hotel: Hotel, formData: CustomerFormData): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    try {
      // 1. LOCATION MATCHING (40 points max)
      const preferredCities = (formData?.preferredCities || '')
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(c => c.length > 0);

      const hotelLocation = (hotel?.location || '').toLowerCase();
      
      if (preferredCities.some(city => hotelLocation.includes(city))) {
        score += 40;
        reasons.push(`Located in ${hotel.location}`);
      } else {
        score += 10; // Default bonus
      }

      // 2. RATING SCORE (30 points max)
      const rating = parseFloat(String(hotel?.rating || 0));
      if (rating >= 4.5) {
        score += 30;
        reasons.push(`Highly rated: ${rating}★`);
      } else if (rating >= 4.0) {
        score += 20;
        reasons.push(`Good rating: ${rating}★`);
      } else if (rating >= 3.0) {
        score += 10;
        reasons.push(`Rated: ${rating}★`);
      }

      // 3. PRICE SCORE (20 points)
      const price = parseInt(String(hotel?.price_per_night || 0), 10);
      if (price > 0 && price < 500) {
        score += 20;
      } else if (price >= 500) {
        score += 15;
      }

      // 4. AMENITIES BONUS (10 points)
      const amenities = Array.isArray(hotel?.amenities) ? hotel.amenities : [];
      const desiredAmenities = ['WiFi', 'Restaurant', 'Pool', 'Spa', 'Gym', 'AC'];
      const matchedAmenities = amenities.filter((a: any) =>
        desiredAmenities.some(d => String(a || '').includes(d))
      );
      if (matchedAmenities.length > 0) {
        score += 10;
        reasons.push(`Amenities: ${matchedAmenities.slice(0, 2).join(', ')}`);
      }

      return { hotel, score: Math.max(5, score), reasons };
    } catch (e) {
      console.error('Error scoring hotel:', e, hotel);
      return { hotel, score: 5, reasons: ['Available'] };
    }
  }

  /**
   * VALIDATION: Check if hotel meets minimum requirements
   */
  private meetsMinimumRequirements(hotel: Hotel, formData: CustomerFormData): boolean {
    // Basic validation - hotel must have location and name
    return !!(hotel?.name && hotel?.location);
  }

  /**
   * TESTING: Get detailed scores for all hotels (for debugging)
   */
  async getDetailedScores(formData: CustomerFormData): Promise<RecommendationScore[]> {
    try {
      const { data: hotels, error } = await supabase
        .from('hotels')
        .select('*');

      if (error || !hotels) return [];

      const scoredHotels = (hotels as Hotel[])
        .map((hotel) => this.scoreHotel(hotel, formData))
        .sort((a, b) => b.score - a.score);

      return scoredHotels;
    } catch (error) {
      console.error('Error getting detailed scores:', error);
      return [];
    }
  }
}

export const hotelRecommendationService = new HotelRecommendationService();
