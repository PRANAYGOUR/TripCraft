import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { AdminLogin } from './components/AdminLogin';
import { OverviewPage } from './components/OverviewPage';
import { authService } from './services/auth.service';
import { tripService } from './services/tripService';
import { User } from './types/shared.types';
import type { Trip } from './types/admin';

type Screen = 'login' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        if (user && user.role === 'admin') {
          setCurrentUser(user);
          setCurrentScreen('dashboard');
          loadAllTrips();
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

  const loadAllTrips = async () => {
    try {
      setIsRefreshing(true);
      const result = await tripService.getAllTrips();
      if (result.success) {
        setTrips(result.data || []);
        console.log('✅ Loaded trips:', result.data);
      } else {
        console.error('❌ Error loading trips:', result.error);
      }
    } catch (err) {
      console.error('❌ Error loading trips:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
    loadAllTrips();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentScreen('login');
    setTrips([]);
  };

  const handleViewTrip = (tripId: string) => {
    console.log('View trip:', tripId);
    // TODO: Implement trip detail view
  };

  return (
    <>
      {currentScreen === 'login' && <AdminLogin onLoginSuccess={handleLogin} />}
      {currentScreen === 'dashboard' && (
        <div>
          <div className="flex justify-between items-center p-4 border-b">
            <h1>Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAllTrips}
                title="Refresh trips"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50"
                disabled={isRefreshing}
              >
                <RefreshCw className={isRefreshing ? 'w-4 h-4 animate-spin text-blue-600' : 'w-4 h-4 text-gray-700'} />
                <span className="text-sm">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
          <OverviewPage 
            onViewTrip={handleViewTrip}
            trips={trips}
            onRefreshTrips={loadAllTrips}
          />
        </div>
      )}
    </>
  );
}
