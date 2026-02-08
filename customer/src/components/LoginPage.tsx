import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Mail, Lock, Plane } from 'lucide-react';
import { authService } from '../services/auth.service';
import { User } from '../types/shared.types';
import SignupPage from './SignupPage';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    const result = await authService.loginCustomer(email, password);
    setIsLoading(false);

    if (result.success && result.data) {
      onLogin(result.data.user);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  if (showSignup) {
    return (
      <SignupPage 
        onSignupSuccess={onLogin}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-xl">
            <Plane className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl text-white mb-2">TripCraft</h1>
          <p className="text-white/80">Your Perfect Journey Awaits</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl mb-2">Welcome Back</h2>
            <p className="text-gray-600">
              Sign in to manage your trips
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSignup(true)}
            disabled={isLoading}
            className="w-full h-12 mt-4"
          >
            Create New Account
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            New to TripCraft? Create an account to get started
          </p>
        </Card>

        <p className="text-center text-white/70 text-sm mt-6">
          No setup required - create an account or use test credentials
        </p>
      </div>
    </div>
  );
}
