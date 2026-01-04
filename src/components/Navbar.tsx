import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Grid3x3, ImageIcon, Phone, LogIn, UserPlus, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  userRole?: 'guest' | 'resident' | 'admin';
  userName?: string;
}

export function Navbar({ userRole = 'guest', userName }: NavbarProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicMenuItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Catalogue', path: '/catalogue', icon: Building2 },
    { label: 'Facilities', path: '/facilities', icon: Grid3x3 },
    { label: 'Gallery', path: '/gallery', icon: ImageIcon },
    { label: 'Contact', path: '/contact', icon: Phone }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-xl text-primary">GreenView</div>
              <div className="text-xs text-text-secondary">Apartment</div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {publicMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 transition-colors ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center gap-4">
            {userRole === 'guest' ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            ) : (
              <Link
                to={userRole === 'admin' ? '/admin/dashboard' : '/resident/dashboard'}
                className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-tertiary/20 transition-colors"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-text-primary">{userName}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-primary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {publicMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                    isActive(item.path)
                      ? 'text-primary bg-tertiary/20 rounded-lg'
                      : 'text-text-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="border-t pt-4 mt-2">
                {userRole === 'guest' ? (
                  <div className="flex flex-col gap-2 px-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-full"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Register
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={userRole === 'admin' ? '/admin/dashboard' : '/resident/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2"
                  >
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-text-primary">{userName}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
