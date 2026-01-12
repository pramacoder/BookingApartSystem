import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  CreditCard,
  CalendarDays,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Building2,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

export function ResidentSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/resident/dashboard', icon: LayoutDashboard },
    { label: 'My Unit', path: '/resident/unit', icon: Home },
    { label: 'Payment Center', path: '/resident/payment', icon: CreditCard },
    { label: 'Facility Booking', path: '/resident/bookings', icon: CalendarDays },
    { label: 'Chat', path: '/resident/chat', icon: MessageSquare },
    { label: 'Announcements', path: '/resident/announcements', icon: Bell },
    { label: 'Complaints', path: '/resident/complaints', icon: MessageSquare },
    { label: 'Profile', path: '/resident/profile', icon: User },
    { label: 'Settings', path: '/resident/settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={`bg-white shadow-lg transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } flex flex-col h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="p-6 border-b flex items-center justify-between">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg text-primary">GreenView</div>
              <div className="text-xs text-text-secondary">Resident Portal</div>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-text-secondary hover:bg-tertiary/20 hover:text-primary'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Link
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
