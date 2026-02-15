import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Mail, Lock, Building2, LayoutDashboard, User } from 'lucide-react';
import { authService } from '../services/auth.service';
import { UserRole } from '../types/shared.types';

export function LoginPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState<UserRole>('admin');
    const [isSignup, setIsSignup] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // For demo/dev ease
    const fillDemo = (roleIs: UserRole) => {
        setRole(roleIs);
        setIsSignup(false);
        if (roleIs === 'admin') {
            setEmail('admin@micetravel.com');
            setPassword('admin123');
        } else {
            setEmail('hotel@partner.com');
            setPassword('hotel123');
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;

            if (isSignup) {
                // SIGNUP LOGIC
                if (role === 'admin') {
                    result = await authService.signupAdmin(email, password, fullName);
                } else if (role === 'hotel_partner') {
                    result = await authService.signupHotelPartner(email, password, fullName);
                } else {
                    throw new Error("Invalid role for signup");
                }
            } else {
                // LOGIN LOGIC
                if (role === 'admin') {
                    result = await authService.loginAdmin(email, password);
                } else if (role === 'hotel_partner') {
                    result = await authService.loginHotelPartner(email, password);
                } else {
                    throw new Error("Invalid role selection");
                }
            }

            if (result.success && result.data) {
                const userRole = result.data.user.role;
                if (userRole === 'admin') {
                    navigate('/admin-dashboard');
                } else if (userRole === 'hotel_partner') {
                    navigate('/hotel-dashboard');
                } else {
                    setError('Invalid role');
                }
            } else {
                setError(result.error || 'Authentication failed');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${role === 'admin' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'}`}></div>

                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-4 transition-colors duration-300">
                        {role === 'admin' ? (
                            <LayoutDashboard className="w-8 h-8 text-blue-400" />
                        ) : (
                            <Building2 className="w-8 h-8 text-purple-400" />
                        )}
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">
                        {role === 'admin' ? 'Admin Portal' : 'Hotel Partner Portal'}
                    </h1>
                    <p className="text-muted-foreground">{isSignup ? 'Create Account' : 'Welcome Back'}</p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 mb-6 bg-slate-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin'
                            ? 'bg-white shadow text-slate-900'
                            : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('hotel_partner')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'hotel_partner'
                            ? 'bg-white shadow text-slate-900'
                            : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        Hotel Partner
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Full Name - Signup Only */}
                    {isSignup && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder={role === 'admin' ? "Admin Name" : "Hotel Manager Name"}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-9 h-11"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder={role === 'admin' ? "admin@micetravel.com" : "reservations@hotel.com"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-9 h-11"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-9 h-11"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className={`w-full h-11 font-semibold transition-colors ${role === 'admin'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                    </Button>
                </form>

                {/* Switch between Login and Signup */}
                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">
                        {isSignup ? "Already have an account?" : "Don't have an account?"}
                    </span>
                    <button
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError('');
                        }}
                        className={`ml-2 font-medium hover:underline ${role === 'admin' ? 'text-blue-600' : 'text-purple-600'}`}
                    >
                        {isSignup ? "Sign In" : "Sign Up"}
                    </button>
                </div>

                {!isSignup && (
                    <div className="mt-6 flex justify-center gap-4 text-xs text-gray-400 pt-4 border-t">
                        <button onClick={() => fillDemo('admin')} className="hover:text-blue-500">Demo Admin</button>
                        <span>|</span>
                        <button onClick={() => fillDemo('hotel_partner')} className="hover:text-purple-500">Demo Hotel</button>
                    </div>
                )}
            </Card>
        </div>
    );
}
