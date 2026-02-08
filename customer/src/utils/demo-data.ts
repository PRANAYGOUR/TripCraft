// Demo data helper - adds sample trips for demonstration
export function initializeDemoData(userEmail: string) {
  const existingTrips = localStorage.getItem('trips');
  
  // Only add demo data if no trips exist
  if (!existingTrips) {
    const demoTrips = [
      {
        id: '1',
        email: userEmail,
        name: 'John Doe',
        contact: '+1 (555) 123-4567',
        location: 'Goa, India',
        eventPurpose: 'Annual General Meeting (AGM) / Leadership Meet',
        preferredCities: 'Goa, Panjim',
        locationsNearby: ['Beachside', 'City'],
        stayType: ['Resorts'],
        starCategory: ['5-star'],
        numberOfPeople: 50,
        duration: 3,
        singleRooms: 5,
        doubleRooms: 20,
        tripleRooms: 2,
        quadRooms: 0,
        checkIn: new Date('2026-03-15').toISOString(),
        checkOut: new Date('2026-03-18').toISOString(),
        requiresEventHall: true,
        hallSetup: ['Theatre Style', 'U-Shape'],
        avRequirements: ['Projector', 'LED Screen / Display', 'High-Speed Internet / Wi-Fi'],
        eventServices: ['Event Coordinator / On-site Support', 'Photography & Videography'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        mealType: ['Both'],
        serviceStyle: ['Buffet'],
        status: 'recommended',
        submittedAt: new Date('2026-02-01').toISOString(),
        recommendation: {
          hotelName: 'Taj Exotica Resort & Spa',
          hotelLocation: 'Benaulim Beach, South Goa',
          starRating: 5,
          pricePerNight: '$250 per room per night',
          amenities: ['Conference Hall', 'Beachfront', 'Spa', 'Pool', 'High-Speed WiFi', 'Business Center'],
          description: 'Perfect beachside resort with state-of-the-art conference facilities. Ideal for your AGM with 50 attendees. Includes dedicated event coordinator and all AV equipment.'
        }
      },
      {
        id: '2',
        email: userEmail,
        name: 'John Doe',
        contact: '+1 (555) 123-4567',
        location: 'Manali, India',
        eventPurpose: 'Training, Workshops & Certifications',
        preferredCities: 'Manali, Shimla',
        locationsNearby: ['Mountains', 'Forest / Nature'],
        stayType: ['Hotels'],
        starCategory: ['4-star'],
        numberOfPeople: 30,
        duration: 5,
        singleRooms: 10,
        doubleRooms: 10,
        tripleRooms: 0,
        quadRooms: 0,
        checkIn: new Date('2026-04-10').toISOString(),
        checkOut: new Date('2026-04-15').toISOString(),
        requiresEventHall: true,
        hallSetup: ['Classroom Style', 'Round Table'],
        avRequirements: ['Handheld Microphones', 'Projector', 'Whiteboard / Flipchart'],
        eventServices: ['Event Coordinator / On-site Support'],
        meals: ['Breakfast', 'Lunch', 'Evening Tea / Coffee', 'Dinner'],
        mealType: ['Vegetarian', 'Non-Vegetarian'],
        serviceStyle: ['Buffet', 'Set Menu'],
        status: 'accepted',
        submittedAt: new Date('2026-01-28').toISOString(),
        recommendation: {
          hotelName: 'The Himalayan Hotel',
          hotelLocation: 'Old Manali Road, Manali',
          starRating: 4,
          pricePerNight: '$120 per room per night',
          amenities: ['Training Rooms', 'Mountain View', 'Restaurant', 'WiFi', 'Parking'],
          description: 'Excellent mountain retreat with dedicated training facilities. Perfect for workshops in a serene environment.'
        }
      },
      {
        id: '3',
        email: userEmail,
        name: 'John Doe',
        contact: '+1 (555) 123-4567',
        location: 'Dubai, UAE',
        eventPurpose: 'Product Launch / Corporate Roadshow',
        preferredCities: 'Dubai',
        locationsNearby: ['City'],
        stayType: ['Hotels'],
        starCategory: ['5-star'],
        numberOfPeople: 100,
        duration: 2,
        singleRooms: 15,
        doubleRooms: 40,
        tripleRooms: 0,
        quadRooms: 0,
        checkIn: new Date('2026-05-20').toISOString(),
        checkOut: new Date('2026-05-22').toISOString(),
        requiresEventHall: true,
        hallSetup: ['Theatre Style', 'Cocktail / Open Layout'],
        avRequirements: ['LED Screen / Display', 'Sound System & Speakers', 'Video Conferencing Setup'],
        eventServices: ['Stage & Backdrop Setup', 'Lighting (Basic / Decorative / Stage Lighting)', 'Event Decoration & Branding', 'Photography & Videography', 'Master of Ceremonies (MC / Anchor)'],
        meals: ['Welcome Drink', 'Lunch', 'Dinner'],
        mealType: ['Both'],
        serviceStyle: ['Buffet', 'Live Counters'],
        status: 'pending',
        submittedAt: new Date('2026-02-05').toISOString()
      }
    ];

    localStorage.setItem('trips', JSON.stringify(demoTrips));
  }
}
