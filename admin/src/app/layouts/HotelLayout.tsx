import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    Building2,
    MessageSquare,
    BarChart2,
    LogOut,
    Bell,
    Settings,
    ListTodo
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { authService } from '../services/auth.service';

export function HotelLayout() {
    const navigate = useNavigate();
    // Simulated user for now
    const [currentUser] = useState(() => ({ name: 'Luxury Hotel Partner', email: 'reservations@hotel.com', role: 'hotel_partner' }));

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/hotel-dashboard', icon: ListTodo },
        { name: 'My Active RFQs', href: '/hotel-dashboard', icon: Building2 }, // Same as dashboard for now
        { name: 'Negotiations', href: '/hotel-negotiations', icon: MessageSquare },
        { name: 'Performance', href: '/hotel-performance', icon: BarChart2 },
        { name: 'Settings', href: '/hotel-settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        H
                    </div>
                    <div>
                        <h2 className="text-white font-semibold">Hotel Partner</h2>
                        <p className="text-xs text-slate-500">TripCraft Supplier</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
                            L
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full justify-start text-red-400 border-slate-700 hover:bg-slate-800 hover:text-red-300"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Hotel Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</p>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
