import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'resident' | 'guest';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole) {
    // If user doesn't have profile yet, allow access (will be set up later)
    if (!profile) {
      // Allow access but might need to setup profile
      return <>{children}</>;
    }

    // Check if user has required role
    if (requiredRole === 'admin' && profile.role !== 'admin') {
      // Redirect to resident dashboard if trying to access admin area
      return <Navigate to="/resident/dashboard" replace />;
    }

    if (requiredRole === 'resident' && profile.role !== 'resident' && profile.role !== 'admin') {
      // Redirect to login if not resident or admin
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}

