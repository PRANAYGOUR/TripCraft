import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import { authService } from './services/auth.service';
import { tripService } from './services/tripService';
import { CustomerFormData, User } from './types/shared.types';

type Screen = 'login' | 'dashboard' | 'form1' | 'form2' | 'success';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<CustomerFormData>({
    email: '',
    name: '',
    destination: '',
    startDate: null,
    endDate: null,
    budget: 0,
    travelers: 0,
    travelStyle: '',
    dietaryRestrictions: [],
    accommodationPreferences: [],
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setCurrentScreen('dashboard');
        } else {
          authService.logout();
          setCurrentScreen('login');
        }
      } else {
        setCurrentScreen('login');
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setFormData(prev => ({...prev, email: user.email, name: user.name}));
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const handleNewTrip = () => {
    // Reset form data
    setFormData({
      email: currentUser?.email || '',
      name: currentUser?.name || '',
      destination: '',
      startDate: null,
      endDate: null,
      budget: 0,
      travelers: 0,
      travelStyle: '',
      dietaryRestrictions: [],
      accommodationPreferences: [],
    });
    setSubmitError('');
    setCurrentScreen('form1');
  };

  const handlePage1Submit = (data: Partial<CustomerFormData>) => {
    console.log('✅ Page1 data received:', data);
    // Map location -> destination immediately
    const mapped = {
      ...formData,
      ...data,
      destination: (data as any).location || data.destination || '',
      email: currentUser?.email || data.email || '',
      name: currentUser?.name || data.name || '',
    };
    console.log('📍 After mapping Page1:', mapped);
    setFormData(mapped);
    setCurrentScreen('form2');
  };

  const handlePage2Submit = async (pageData: Partial<CustomerFormData>) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      console.log('📝 Page2 data received:', pageData);
      console.log('📝 Current formData state:', formData);

      // Build complete data with all mappings
      const tripData: CustomerFormData = {
        // Start with current state
        ...formData,
        // Overlay Page2 data
        ...pageData,
        // Explicit mappings for fields that change names
        startDate: (pageData as any).checkIn || formData.startDate,
        endDate: (pageData as any).checkOut || formData.endDate,
        travelers: (pageData as any).numberOfPeople || (pageData as any).travelers || 1,
        travelStyle: (pageData as any).eventPurpose || formData.travelStyle || 'General',
        budget: formData.budget || 0,
        // Ensure email/name from user
        email: currentUser?.email || formData.email || '',
        name: currentUser?.name || formData.name || '',
        // Destination must come from Page1 (already in formData)
        destination: formData.destination || '',
      };

      console.log('🚀 Final trip data to submit:', tripData);

      // VALIDATE before submit
      const errors = [];
      if (!tripData.destination) errors.push('Destination is required');
      if (!tripData.startDate) errors.push('Check-in date is required');
      if (!tripData.endDate) errors.push('Check-out date is required');
      if (tripData.travelers <= 0) errors.push('Number of travelers is required');

      if (errors.length > 0) {
        setSubmitError(errors.join(', '));
        setIsSubmitting(false);
        return;
      }

      // Submit to DB
      const result = await tripService.createTrip(tripData);

      if (result.success) {
        console.log('✅✅✅ TRIP CREATED SUCCESSFULLY:', result.data);
        setFormData(tripData);
        setCurrentScreen('success');
      } else {
        console.error('❌ Trip creation failed:', result.error);
        setSubmitError(result.error || 'Failed to create trip');
      }
    } catch (error) {
      console.error('❌ Exception during trip creation:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  // Success Screen
  if (currentScreen === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl mb-4">✅ Trip Created Successfully!</h2>
            <p className="text-xl text-gray-700 mb-4">
              Your trip request has been saved to the database.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-purple-900 mb-2">What happens next?</h3>
              <div className="text-left space-y-2 text-gray-700">
                <p>✨ <strong>Step 1:</strong> Admin will review your trip requirements</p>
                <p>🏨 <strong>Step 2:</strong> Admin will recommend hotels based on your needs</p>
                <p>✅ <strong>Step 3:</strong> You can accept or reject the recommendation</p>
              </div>
            </div>
            <p className="text-gray-600">
              Your trip status is <strong>"pending"</strong>. Check your dashboard for updates!
            </p>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentScreen === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentScreen === 'dashboard' && (
        <Dashboard 
          userEmail={currentUser?.email || ''}
          onLogout={handleLogout} 
          onNewTrip={handleNewTrip} 
        />
      )}
      {currentScreen === 'form1' && (
        <Page1 
          onSubmit={handlePage1Submit} 
          initialData={formData}
          onBack={handleBackToDashboard}
        />
      )}
      {currentScreen === 'form2' && (
        <Page2 
          onSubmit={handlePage2Submit} 
          initialData={formData} 
          onBack={() => setCurrentScreen('form1')}
        />
      )}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg font-semibold">Creating your trip...</p>
          </div>
        </div>
      )}
      {submitError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50">
          <p>Error: {submitError}</p>
        </div>
      )}
    </>
  );
}
