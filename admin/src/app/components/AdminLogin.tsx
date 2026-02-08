import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Mail, Lock, BarChart3 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { User } from '../types/shared.types';
import AdminSignupPage from './AdminSignupPage';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    const result = await authService.loginAdmin(email, password);
    setLoading(false);

    if (result.success && result.data) {
      onLoginSuccess(result.data.user);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  if (showSignup) {
    return (
      <AdminSignupPage 
        onSignupSuccess={onLoginSuccess}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">MICE Admin</h1>
          <p className="text-muted-foreground">Trip Planning System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-600" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@micetravel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-600" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-input-background"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white font-semibold"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowSignup(true)}
          disabled={loading}
          className="w-full h-12 mt-4"
        >
          Create Admin Account
        </Button>

        <p className="text-center text-sm text-gray-600 mt-4">
          New to MICE Admin? Create an account to get started
        </p>
      </Card>
    </div>
  );
}
