import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  getCurrentUser,
  getSession,
  onAuthStateChange,
  getUserProfile,
  getUserRole,
  getDemoAuth,
  UserProfile,
} from '../lib/auth';

export function useAuth() {
  const initialDemo = typeof window !== 'undefined' ? getDemoAuth() : null;

  const [user, setUser] = useState<User | null>(initialDemo?.user ?? null);
  const [session, setSession] = useState<Session | null>(
    initialDemo
      ? ({
          access_token: 'demo_token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'demo_refresh',
          user: initialDemo.user,
        } as Session)
      : null
  );
  const [profile, setProfile] = useState<UserProfile | null>(initialDemo?.profile ?? null);
  const [role, setRole] = useState<'admin' | 'resident' | 'guest'>(initialDemo?.role ?? 'guest');
  const [loading, setLoading] = useState(!initialDemo);

  useEffect(() => {
    // Get initial session
    getSession().then(async (session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userRole = await getUserRole(session.user.id);
        setRole(userRole);
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setRole('guest');
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userRole = await getUserRole(session.user.id);
        setRole(userRole);
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setRole('guest');
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    profile,
    role,
    loading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isResident: role === 'resident',
  };
}
