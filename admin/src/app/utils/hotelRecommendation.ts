import { Trip, Hotel, RecommendedHotel } from '../types/admin';
import { hotels } from '../data/mockData';

/**
 * Automated Hotel Recommendation Engine
 * This is a rule-based matching system that compares trip requirements
 * with available hotels and generates recommendations with match scores.
 */

export function generateHotelRecommendations(trip: Trip): RecommendedHotel[] {
  const recommendations: RecommendedHotel[] = [];
  
  // Filter out already rejected hotels
  const rejectedIds = trip.rejectedHotelIds || [];
  const availableHotels = hotels.filter(hotel => !rejectedIds.includes(hotel.id));
  
  for (const hotel of availableHotels) {
    let matchScore = 0;
    const matchReasons: string[] = [];
    
    // Rule 1: Destination city match (HIGH PRIORITY - 30 points)
    if (hotel.city.toLowerCase() === trip.destination.toLowerCase()) {
      matchScore += 30;
      matchReasons.push('Located in requested destination');
    } else if (trip.preferredCities.some(city => 
      hotel.city.toLowerCase().includes(city.toLowerCase()) || 
      city.toLowerCase().includes(hotel.city.toLowerCase())
    )) {
      matchScore += 20;
      matchReasons.push('Located in preferred city area');
    } else {
      // Skip hotels not in the destination area
      continue;
    }
    
    // Rule 2: Location type match (20 points)
    const locationMatch = trip.locationsNearby.some(loc => 
      hotel.locationType.some(hotelLoc => 
        hotelLoc.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(hotelLoc.toLowerCase())
      )
    );
    if (locationMatch) {
      matchScore += 20;
      const matchedTypes = trip.locationsNearby.filter(loc =>
        hotel.locationType.some(hotelLoc => 
          hotelLoc.toLowerCase().includes(loc.toLowerCase())
        )
      ).join(', ');
      matchReasons.push(`Matches preferred location: ${matchedTypes}`);
    }
    
    // Rule 3: Star category match (15 points)
    const starMatch = checkStarCategoryMatch(trip.starCategory, hotel.starRating);
    if (starMatch) {
      matchScore += 15;
      matchReasons.push(`${hotel.starRating}-star rating matches preference`);
    }
    
    // Rule 4: Room capacity check (15 points)
    const totalRoomsNeeded = Object.values(trip.roomRequirements).reduce((a, b) => a + b, 0);
    if (hasRequiredRoomTypes(hotel, trip.roomRequirements)) {
      matchScore += 15;
      matchReasons.push('Has all required room types available');
    } else if (hotel.totalRooms >= totalRoomsNeeded) {
      matchScore += 8;
      matchReasons.push('Sufficient total room capacity');
    }
    
    // Rule 5: Event hall requirements (10 points)
    if (trip.eventHallRequired && hotel.eventHallAvailable) {
      if (hotel.hallCapacity && hotel.hallCapacity >= trip.numberOfPeople) {
        matchScore += 10;
        matchReasons.push(`Event hall capacity: ${hotel.hallCapacity} guests`);
      } else {
        matchScore += 5;
        matchReasons.push('Event hall available');
      }
    }
    
    // Rule 6: Audio-visual equipment (5 points)
    if (trip.audioVisualRequirements && hotel.audioVisualEquipment) {
      const avMatch = trip.audioVisualRequirements.some(req =>
        hotel.audioVisualEquipment?.some(equip =>
          equip.toLowerCase().includes(req.toLowerCase())
        )
      );
      if (avMatch) {
        matchScore += 5;
        matchReasons.push('Has required A/V equipment');
      }
    }
    
    // Rule 7: Meal options (5 points)
    if (trip.meals && hotel.mealOptions) {
      const mealMatch = trip.meals.every(meal =>
        hotel.mealOptions.some(option =>
          option.toLowerCase().includes(meal.toLowerCase())
        )
      );
      if (mealMatch) {
        matchScore += 5;
        matchReasons.push('Provides all requested meal options');
      }
    }
    
    // Only include hotels with reasonable match score (at least 40%)
    if (matchScore >= 40) {
      recommendations.push({
        ...hotel,
        matchScore,
        matchReason: matchReasons.join(' • ')
      });
    }
  }
  
  // Sort by match score (highest first) and return top 3
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

function checkStarCategoryMatch(requestedCategory: string, hotelStarRating: number): boolean {
  const category = requestedCategory.toLowerCase();
  
  if (category.includes('5')) {
    return hotelStarRating === 5;
  } else if (category.includes('4-5') || category.includes('4 to 5')) {
    return hotelStarRating >= 4 && hotelStarRating <= 5;
  } else if (category.includes('4')) {
    return hotelStarRating === 4;
  } else if (category.includes('3-4') || category.includes('3 to 4')) {
    return hotelStarRating >= 3 && hotelStarRating <= 4;
  } else if (category.includes('3')) {
    return hotelStarRating === 3;
  }
  
  return true; // If no specific category, accept all
}

function hasRequiredRoomTypes(hotel: Hotel, requirements: Trip['roomRequirements']): boolean {
  return (
    hotel.roomTypes.single >= requirements.single &&
    hotel.roomTypes.double >= requirements.double &&
    hotel.roomTypes.triple >= requirements.triple &&
    hotel.roomTypes.quad >= requirements.quad
  );
}

/**
 * Get a single hotel by ID
 */
export function getHotelById(hotelId: string): Hotel | undefined {
  return hotels.find(h => h.id === hotelId);
}
