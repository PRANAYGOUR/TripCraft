/**
 * HOTEL RECOMMENDATION ENGINE
 * Rule-based matching system (NO AI/ML)
 * Generates 2-3 hotels based on trip requirements
 */

import { supabase } from './supabaseClient';
import { CustomerFormData, Hotel } from '../shared.types';

interface RecommendationScore {
  hotel: Hotel;
  score: number;
  reasons: string[];
}

class HotelRecommendationService {
  /**
   * MAIN: Generate 2-3 hotel recommendations
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

      // Sort by score and return top 3
      const recommended = scoredHotels
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
   * SCORING LOGIC
   * Each rule contributes points
   */
  private scoreHotel(hotel: Hotel, formData: CustomerFormData): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    // 1. LOCATION MATCHING (25 points max)
    const preferredCities = formData.preferredCities
      .split(',')
      .map((c) => c.trim().toLowerCase());

    if (preferredCities.includes(hotel.city.toLowerCase())) {
      score += 25;
      reasons.push(`Located in preferred city: ${hotel.city}`);
    } else {
      score += 5; // Small bonus for any match
    }

    // 2. LOCATION TYPE PREFERENCE (20 points max)
    const stayTypePreferences = formData.stayType.map((s) => s.toLowerCase());
    const hotelLocationType = hotel.location_type.map((l) => l.toLowerCase());

    let locationTypeMatch = 0;
    stayTypePreferences.forEach((pref) => {
      if (hotelLocationType.includes(pref)) {
        locationTypeMatch += 10;
      }
    });
    score += Math.min(locationTypeMatch, 20);
    if (locationTypeMatch > 0) {
      reasons.push(`Matches location preference: ${stayTypePreferences.join(', ')}`);
    }

    // 3. STAR CATEGORY (20 points max)
    const preferredStars = formData.starCategory.map((s) => parseInt(s, 10));
    if (preferredStars.includes(hotel.star_rating)) {
      score += 20;
      reasons.push(`Matches preferred star rating: ${hotel.star_rating}★`);
    } else if (Math.max(...preferredStars) >= hotel.star_rating) {
      score += 10; // Partial match if hotel is lower than max preference
    }

    // 4. ROOM AVAILABILITY (20 points max)
    const requiredRooms = {
      single: formData.singleRooms,
      double: formData.doubleRooms,
      triple: formData.tripleRooms,
      quad: formData.quadRooms,
    };

    let roomMatch = 0;
    let roomsMissing = 0;

    Object.entries(requiredRooms).forEach(([type, count]) => {
      if (count > 0 && hotel.room_types[type as keyof typeof hotel.room_types] >= count) {
        roomMatch += 5;
      } else if (count > 0) {
        roomsMissing += 1;
      }
    });

    score += Math.min(roomMatch, 20);
    if (roomMatch > 0) {
      reasons.push(`Has sufficient room availability`);
    }

    // 5. EVENT HALL REQUIREMENTS (15 points max)
    if (formData.requiresEventHall) {
      if (hotel.event_hall_available) {
        score += 15;
        reasons.push(`Has event hall (capacity: ${hotel.hall_capacity})`);
      } else {
        score -= 10; // Penalty if event hall is required but not available
      }
    } else {
      score += 5; // Bonus for having event hall even if not required
    }

    // 6. MEAL OPTIONS (10 points max)
    const mealPreferences = formData.meals.map((m) => m.toLowerCase());
    const hotelMealOptions = hotel.meal_options.map((m) => m.toLowerCase());

    let mealMatch = 0;
    mealPreferences.forEach((pref) => {
      if (hotelMealOptions.includes(pref)) {
        mealMatch += 5;
      }
    });
    score += Math.min(mealMatch, 10);
    if (mealMatch > 0) {
      reasons.push(`Offers meal options: ${mealPreferences.join(', ')}`);
    }

    // 7. PRICE RANGE PREFERENCE (10 points)
    // starCategory can be used as proxy for budget preference
    const maxStarPreference = Math.max(...preferredStars);
    if (maxStarPreference >= 4 && hotel.price_range === 'luxury') {
      score += 10;
      reasons.push(`Premium pricing matches expectations`);
    } else if (maxStarPreference === 3 && hotel.price_range === 'moderate') {
      score += 10;
      reasons.push(`Pricing matches expectations`);
    } else if (maxStarPreference <= 2 && hotel.price_range === 'budget') {
      score += 10;
      reasons.push(`Budget-friendly option`);
    }

    return { hotel, score: Math.max(0, score), reasons };
  }

  /**
   * VALIDATION: Check if hotel meets minimum requirements
   */
  private meetsMinimumRequirements(hotel: Hotel, formData: CustomerFormData): boolean {
    // Event hall is MUST if required
    if (formData.requiresEventHall && !hotel.event_hall_available) {
      return false;
    }

    // Check total available rooms
    const totalRoomsNeeded =
      formData.singleRooms +
      formData.doubleRooms +
      formData.tripleRooms +
      formData.quadRooms;

    const totalRoomsAvailable =
      hotel.room_types.single +
      hotel.room_types.double +
      hotel.room_types.triple +
      hotel.room_types.quad;

    if (totalRoomsAvailable < totalRoomsNeeded) {
      return false;
    }

    return true;
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
