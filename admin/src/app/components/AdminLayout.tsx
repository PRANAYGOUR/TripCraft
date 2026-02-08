import { ReactNode } from 'react';
import { LogOut, LayoutDashboard, List, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { User } from '../types/shared.types';

interface AdminLayoutProps {
  children: ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export function AdminLayout({ children, currentUser, onLogout }: AdminLayoutProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'trips', label: 'All Trips', icon: List }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-primary">MICE Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">Trip Planning System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <div key={item.id} className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100">
                  <Icon className="size-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-2">
            <p className="text-sm text-gray-900">{currentUser.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              title="Refresh dashboard"
              className="flex-0 inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <Button
              variant="outline"
              className="flex-1 justify-start"
              onClick={onLogout}
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}