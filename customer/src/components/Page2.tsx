import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  ChevronLeft, 
  Minus, 
  Plus, 
  CalendarIcon,
  Hotel,
  Users,
  Clock,
  Mic,
  Monitor,
  Utensils
} from 'lucide-react';
import { format } from 'date-fns';

interface Page2Props {
  onSubmit: (data: any) => void;
  initialData: any;
  onBack: () => void;
}

export default function Page2({ onSubmit, initialData, onBack }: Page2Props) {
  const [eventPurpose, setEventPurpose] = useState(initialData.eventPurpose || '');
  const [preferredCities, setPreferredCities] = useState(initialData.preferredCities || '');
  const [locationsNearby, setLocationsNearby] = useState<string[]>(initialData.locationsNearby || []);
  const [stayType, setStayType] = useState<string[]>(initialData.stayType || []);
  const [starCategory, setStarCategory] = useState<string[]>(initialData.starCategory || []);
  const [numberOfPeople, setNumberOfPeople] = useState(initialData.numberOfPeople || 0);
  const [duration, setDuration] = useState(initialData.duration || 0);
  const [singleRooms, setSingleRooms] = useState(initialData.singleRooms || 0);
  const [doubleRooms, setDoubleRooms] = useState(initialData.doubleRooms || 0);
  const [tripleRooms, setTripleRooms] = useState(initialData.tripleRooms || 0);
  const [quadRooms, setQuadRooms] = useState(initialData.quadRooms || 0);
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialData.checkIn || undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialData.checkOut || undefined);
  const [requiresEventHall, setRequiresEventHall] = useState(initialData.requiresEventHall || false);
  const [hallSetup, setHallSetup] = useState<string[]>(initialData.hallSetup || []);
  const [avRequirements, setAvRequirements] = useState<string[]>(initialData.avRequirements || []);
  const [eventServices, setEventServices] = useState<string[]>(initialData.eventServices || []);
  const [meals, setMeals] = useState<string[]>(initialData.meals || []);
  const [mealType, setMealType] = useState<string[]>(initialData.mealType || []);
  const [serviceStyle, setServiceStyle] = useState<string[]>(initialData.serviceStyle || []);
  const [description, setDescription] = useState(initialData.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      eventPurpose,
      preferredCities,
      locationsNearby,
      stayType,
      starCategory,
      numberOfPeople,
      duration,
      singleRooms,
      doubleRooms,
      tripleRooms,
      quadRooms,
      checkIn,
      checkOut,
      requiresEventHall,
      hallSetup,
      avRequirements,
      eventServices,
      meals,
      mealType,
      serviceStyle,
      description
    });
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const eventPurposeOptions = [
    'Conference / Convention',
    'Annual General Meeting (AGM) / Leadership Meet',
    'Corporate Meeting / Strategy Meet',
    'Training, Workshops & Certifications',
    'Employee Hackathon / Innovation Program',
    'Product Launch / Corporate Roadshow',
    'Exhibition / Trade Show Participation'
  ];

  const locationOptions = [
    'Beachside',
    'Mountains',
    'Forest / Nature',
    'Lakeside',
    'Desert / Heritage',
    'City'
  ];

  const hallSetupOptions = [
    'Theatre Style',
    'U-Shape',
    'Classroom Style',
    'Boardroom Style',
    'Round Table',
    'Oval Setup',
    'Banquet Style',
    'Cocktail / Open Layout'
  ];

  const avOptions = [
    'Handheld Microphones',
    'Collar / Lapel Microphones',
    'Projector',
    'LED Screen / Display',
    'Presentation Clicker',
    'Whiteboard / Flipchart',
    'High-Speed Internet / Wi-Fi',
    'Video Conferencing Setup'
  ];

  const eventServicesOptions = [
    'Stage & Backdrop Setup',
    'Lighting (Basic / Decorative / Stage Lighting)',
    'Sound System & Speakers',
    'Event Decoration & Branding',
    'Event Coordinator / On-site Support',
    'Photography & Videography',
    'Master of Ceremonies (MC / Anchor)'
  ];

  const mealsOptions = [
    'Welcome Drink',
    'Morning Tea / Hi-Tea',
    'Breakfast',
    'Lunch',
    'Evening Tea / Coffee',
    'Dinner'
  ];

  const mealTypeOptions = ['Vegetarian', 'Non-Vegetarian', 'Both'];
  
  const serviceStyleOptions = [
    'Buffet',
    'Set Menu',
    'Live Counters',
    'Grab-and-Go Snacks'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Basic Details
          </button>
          <h1 className="text-3xl md:text-4xl mb-2">Event & Stay Requirements</h1>
          <p className="text-gray-600">Help us plan the perfect event experience for you</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Purpose */}
          <Card className="p-6">
            <Label htmlFor="eventPurpose" className="text-base mb-3 block">
              Purpose of the Event <span className="text-red-500">*</span>
            </Label>
            <select
              id="eventPurpose"
              required
              value={eventPurpose}
              onChange={(e) => setEventPurpose(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select purpose</option>
              {eventPurposeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Card>

          {/* Preferred Cities & Locations */}
          <Card className="p-6 space-y-6">
            <div>
              <Label htmlFor="cities" className="text-base mb-3 block">
                Preferred Cities
              </Label>
              <Input
                id="cities"
                type="text"
                value={preferredCities}
                onChange={(e) => setPreferredCities(e.target.value)}
                placeholder="e.g., Mumbai, Bangalore, Goa"
                className="h-12"
              />
            </div>

            <div>
              <Label className="text-base mb-3 block">Locations Nearby</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {locationOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${option}`}
                      checked={locationsNearby.includes(option)}
                      onCheckedChange={() => toggleArrayItem(locationsNearby, setLocationsNearby, option)}
                    />
                    <label
                      htmlFor={`location-${option}`}
                      className="text-sm cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Stay Preferences */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Stay Preferences</h3>
            </div>

            <div>
              <Label className="text-base mb-3 block">Preferred Stay Type</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hotels"
                    checked={stayType.includes('Hotels')}
                    onCheckedChange={() => toggleArrayItem(stayType, setStayType, 'Hotels')}
                  />
                  <label htmlFor="hotels" className="text-sm cursor-pointer">Hotels</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resorts"
                    checked={stayType.includes('Resorts')}
                    onCheckedChange={() => toggleArrayItem(stayType, setStayType, 'Resorts')}
                  />
                  <label htmlFor="resorts" className="text-sm cursor-pointer">Resorts</label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base mb-3 block">Preferred Star Category</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="3-star"
                    checked={starCategory.includes('3-star')}
                    onCheckedChange={() => toggleArrayItem(starCategory, setStarCategory, '3-star')}
                  />
                  <label htmlFor="3-star" className="text-sm cursor-pointer">3★ Standard</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="4-star"
                    checked={starCategory.includes('4-star')}
                    onCheckedChange={() => toggleArrayItem(starCategory, setStarCategory, '4-star')}
                  />
                  <label htmlFor="4-star" className="text-sm cursor-pointer">4★ Premium</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="5-star"
                    checked={starCategory.includes('5-star')}
                    onCheckedChange={() => toggleArrayItem(starCategory, setStarCategory, '5-star')}
                  />
                  <label htmlFor="5-star" className="text-sm cursor-pointer">5★ Luxury</label>
                </div>
              </div>
            </div>
          </Card>

          {/* Group Size & Duration */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg">Group Size & Duration</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="people" className="text-base mb-3 block">
                  Number of People <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="people"
                  type="number"
                  required
                  min="1"
                  value={numberOfPeople || ''}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-base mb-3 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration of Trip (Days) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  required
                  min="1"
                  value={duration || ''}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="h-12"
                />
              </div>
            </div>
          </Card>

          {/* Room Types */}
          <Card className="p-6">
            <Label className="text-base mb-4 block">Select Room Types</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm">Single Room (1 Guest)</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSingleRooms(Math.max(0, singleRooms - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">{singleRooms}</span>
                  <button
                    type="button"
                    onClick={() => setSingleRooms(singleRooms + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm">Double Room (2 Guests)</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDoubleRooms(Math.max(0, doubleRooms - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">{doubleRooms}</span>
                  <button
                    type="button"
                    onClick={() => setDoubleRooms(doubleRooms + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm">Triple Room (3 Guests)</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTripleRooms(Math.max(0, tripleRooms - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">{tripleRooms}</span>
                  <button
                    type="button"
                    onClick={() => setTripleRooms(tripleRooms + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm">Quad Room (4 Guests)</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuadRooms(Math.max(0, quadRooms - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">{quadRooms}</span>
                  <button
                    type="button"
                    onClick={() => setQuadRooms(quadRooms + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Check-in & Check-out Dates */}
          <Card className="p-6">
            <Label className="text-base mb-4 block flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-green-600" />
              Check-In & Check-Out Dates
            </Label>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="checkIn" className="text-sm mb-2 block">Check-In Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className={checkIn ? 'text-gray-900' : 'text-gray-500'}>
                        {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="checkOut" className="text-sm mb-2 block">Check-Out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className={checkOut ? 'text-gray-900' : 'text-gray-500'}>
                        {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      initialFocus
                      disabled={(date) => checkIn ? date < checkIn : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </Card>

          {/* Event Space Requirements */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Event Space Requirements</h3>
            </div>

            <div>
              <Label className="text-base mb-3 block">
                Do You Require a Conference / Event Hall?
              </Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hall-yes"
                    checked={requiresEventHall}
                    onCheckedChange={(checked) => setRequiresEventHall(checked === true)}
                  />
                  <label htmlFor="hall-yes" className="text-sm cursor-pointer">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hall-no"
                    checked={!requiresEventHall}
                    onCheckedChange={(checked) => setRequiresEventHall(checked !== true)}
                  />
                  <label htmlFor="hall-no" className="text-sm cursor-pointer">No</label>
                </div>
              </div>
            </div>

            {requiresEventHall && (
              <div>
                <Label className="text-base mb-3 block">Preferred Hall Setup</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {hallSetupOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`hall-${option}`}
                        checked={hallSetup.includes(option)}
                        onCheckedChange={() => toggleArrayItem(hallSetup, setHallSetup, option)}
                      />
                      <label htmlFor={`hall-${option}`} className="text-sm cursor-pointer">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Audio-Visual Requirements */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg">Audio-Visual & Workshop Requirements</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {avOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`av-${option}`}
                    checked={avRequirements.includes(option)}
                    onCheckedChange={() => toggleArrayItem(avRequirements, setAvRequirements, option)}
                  />
                  <label htmlFor={`av-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Event Services */}
          <Card className="p-6">
            <h3 className="text-lg mb-3">Event-Specific Services</h3>
            <p className="text-sm text-gray-600 mb-4">
              Recommended for celebrations, award functions & large events
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {eventServicesOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${option}`}
                    checked={eventServices.includes(option)}
                    onCheckedChange={() => toggleArrayItem(eventServices, setEventServices, option)}
                  />
                  <label htmlFor={`service-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Meals & Refreshments */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-green-600" />
              <h3 className="text-lg">Meals & Refreshments</h3>
            </div>

            <div>
              <Label className="text-base mb-3 block">
                Select Meals & Refreshments Needed
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {mealsOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`meal-${option}`}
                      checked={meals.includes(option)}
                      onCheckedChange={() => toggleArrayItem(meals, setMeals, option)}
                    />
                    <label htmlFor={`meal-${option}`} className="text-sm cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base mb-3 block">Meal Type Preference</Label>
              <div className="flex gap-4">
                {mealTypeOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mealtype-${option}`}
                      checked={mealType.includes(option)}
                      onCheckedChange={() => toggleArrayItem(mealType, setMealType, option)}
                    />
                    <label htmlFor={`mealtype-${option}`} className="text-sm cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base mb-3 block">Service Style (Optional)</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {serviceStyleOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`style-${option}`}
                      checked={serviceStyle.includes(option)}
                      onCheckedChange={() => toggleArrayItem(serviceStyle, setServiceStyle, option)}
                    />
                    <label htmlFor={`style-${option}`} className="text-sm cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Additional Notes / Description */}
          <Card className="p-6">
            <Label htmlFor="description" className="text-base mb-3 block">
              Additional Notes or Special Requests (Optional)
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Budget preferences, special dietary needs, unique requirements for the event, preferred dates, etc."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
            />
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg tracking-wide rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              SUBMIT & CRAFT MY EVENT EXPERIENCE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
