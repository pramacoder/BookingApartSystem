import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  getCurrentUser,
  getSession,
  onAuthStateChange,
  getUserProfile,
  getUserRole,
  UserProfile,
} from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'admin' | 'resident' | 'guest'>('guest');
  const [loading, setLoading] = useState(true);

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
      subscription.unsubscribe();
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

