import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { HotelLayout } from './layouts/HotelLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { HotelDashboard } from './pages/HotelDashboard';
import { HotelRFQDetail } from './pages/HotelRFQDetail';
import { AdminTripDetail } from './pages/AdminTripDetail';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-trips" element={<div>Trips List Placeholder</div>} />
          <Route path="/admin-trips/:id" element={<AdminTripDetail />} />
          {/* Add more admin routes here */}
        </Route>

        {/* Hotel Routes */}
        <Route element={<HotelLayout />}>
          <Route path="/hotel-dashboard" element={<HotelDashboard />} />
          <Route path="/hotel-rfq/:id" element={<HotelRFQDetail />} />
          <Route path="/hotel-negotiations" element={<div>Negotiations Placeholder</div>} />
          <Route path="/hotel-performance" element={<div>Performance Placeholder</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
