import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Mail, Lock, BarChart3, User as UserIcon } from 'lucide-react';
import { authService } from '../services/auth.service';
import { User } from '../types/shared.types';

interface AdminSignupPageProps {
  onSignupSuccess: (user: User) => void;
  onBackToLogin: () => void;
}

export default function AdminSignupPage({ onSignupSuccess, onBackToLogin }: AdminSignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !confirmPassword || !fullName || !adminCode) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Simple admin code validation
    if (adminCode !== 'ADMIN2024') {
      setError('Invalid admin code');
      return;
    }

    setIsLoading(true);

    // Use the signup method from auth service
    const result = await authService.signupAdmin(email, password, fullName);
    setIsLoading(false);

    if (result.success && result.data) {
      onSignupSuccess(result.data.user);
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-xl">
            <BarChart3 className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-4xl text-white mb-2">MICE Admin</h1>
          <p className="text-white/60">Create Admin Account</p>
        </div>

        {/* Signup Card */}
        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl mb-2">Admin Registration</h2>
            <p className="text-gray-600">
              Create an admin account to manage trips
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-600" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Admin"
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-600" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@micetravel.com"
                className="h-12"
                disabled={isLoading}
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminCode" className="text-sm font-semibold text-slate-700">
                Admin Code (Required)
              </Label>
              <Input
                id="adminCode"
                type="password"
                required
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter admin code"
                className="h-12"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Contact your administrator for the code</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white font-semibold"
            >
              {isLoading ? 'Creating Account...' : 'Create Admin Account'}
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
            onClick={onBackToLogin}
            disabled={isLoading}
            className="w-full h-12 mt-6"
          >
            Back to Login
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? Click "Back to Login"
          </p>
        </Card>
      </div>
    </div>
  );
}
