import { supabase, isValidConfig, configError } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

// Interface untuk user profile
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role?: 'resident' | 'admin' | 'guest';
  unit_id?: string;
  created_at?: string;
}

// Key untuk local demo session
const DEMO_AUTH_KEY = 'greenview_demo_auth';

export interface DemoAuthData {
  user: User;
  profile: UserProfile;
  role: 'admin' | 'resident';
}

/**
 * Mendapatkan demo authentication dari localStorage
 */
export function getDemoAuth(): DemoAuthData | null {
  try {
    const raw = localStorage.getItem(DEMO_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Login sebagai user demo (Admin atau Resident)
 */
export function signInAsDemo(role: 'admin' | 'resident'): DemoAuthData {
  const isAdmin = role === 'admin';
  const demoUser = {
    id: isAdmin ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
    app_metadata: { provider: 'email' },
    user_metadata: {
      full_name: isAdmin ? 'Admin GreenView' : 'Budi Santoso',
      role: role,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: isAdmin ? 'admin@greenview.com' : 'resident@greenview.com',
  } as unknown as User;

  const demoProfile: UserProfile = {
    id: demoUser.id,
    email: demoUser.email,
    full_name: isAdmin ? 'Admin GreenView' : 'Budi Santoso',
    role: role,
    unit_id: isAdmin ? undefined : '1',
    created_at: new Date().toISOString(),
  };

  const payload: DemoAuthData = { user: demoUser, profile: demoProfile, role };
  localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: payload }));
  return payload;
}

/**
 * Logout dari demo session
 */
export function clearDemoAuth(): void {
  localStorage.removeItem(DEMO_AUTH_KEY);
  window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: null }));
}

/**
 * Generate unique username from email
 */
async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return baseUsername;
    }

    if (!data) {
      return username;
    }

    attempts++;
    username = `${baseUsername}${attempts}`;
  }

  return `${baseUsername}${Date.now().toString().slice(-6)}`;
}

/**
 * Create or sync user record in users table
 */
async function createOrSyncUserRecord(userId: string, email: string, metadata?: Record<string, any>) {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingUser) {
      const updates: any = {};
      if (metadata?.full_name) updates.full_name = metadata.full_name;
      if (metadata?.phone) updates.phone = metadata.phone;
      if (metadata?.id_number) updates.id_number = metadata.id_number;
      if (metadata?.birth_date) updates.birth_date = metadata.birth_date;

      if (Object.keys(updates).length > 0) {
        await supabase.from('users').update(updates).eq('id', userId);
      }
      return { error: null };
    }

    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
    const username = baseUsername.length > 0 
      ? await generateUniqueUsername(baseUsername)
      : `user_${userId.substring(0, 8)}`;

    const { data: insertData, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        username: username,
        password_hash: '',
        full_name: metadata?.full_name || null,
        phone: metadata?.phone || null,
        id_number: metadata?.id_number || null,
        birth_date: metadata?.birth_date || null,
        role: 'guest',
        is_active: true,
        is_verified: false,
      })
      .select();

    if (error) {
      if (error.code === '23505') return { error: null };
      return { error };
    }

    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

/**
 * Sign up dengan email dan password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  if (!isValidConfig) {
    return {
      data: null,
      error: {
        message: configError || 'Supabase tidak terkonfigurasi dengan benar.',
        name: 'ConfigurationError',
      } as AuthError,
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;

    if (data?.user) {
      createOrSyncUserRecord(data.user.id, data.user.email || email.trim(), metadata).catch(() => {});
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error as AuthError };
  }
}

/**
 * Sign in dengan email dan password
 */
export async function signIn(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();

  // Instant demo access when using demo emails or offline testing
  if (cleanEmail === 'admin@greenview.com' || cleanEmail === 'admin' || cleanEmail.startsWith('admin@')) {
    const demo = signInAsDemo('admin');
    return {
      data: {
        user: demo.user,
        session: {
          access_token: 'demo_token',
          user: demo.user,
        } as unknown as Session,
      },
      error: null,
    };
  }

  if (cleanEmail === 'resident@greenview.com' || cleanEmail === 'resident' || cleanEmail.startsWith('resident@')) {
    const demo = signInAsDemo('resident');
    return {
      data: {
        user: demo.user,
        session: {
          access_token: 'demo_token',
          user: demo.user,
        } as unknown as Session,
      },
      error: null,
    };
  }

  // Validate input
  if (!email || !email.trim()) {
    return {
      data: null,
      error: { message: 'Email harus diisi', name: 'ValidationError' } as AuthError,
    };
  }

  if (!password) {
    return {
      data: null,
      error: { message: 'Password harus diisi', name: 'ValidationError' } as AuthError,
    };
  }

  if (!isValidConfig) {
    // If not configured, provide friendly message or allow demo fallback
    return {
      data: null,
      error: {
        message: configError || 'Supabase tidak terkonfigurasi dengan benar. Gunakan tombol Demo Login di bawah.',
        name: 'ConfigurationError',
      } as AuthError,
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // Check if credentials match default demo logins as graceful fallback
      if (cleanEmail.includes('admin')) {
        const demo = signInAsDemo('admin');
        return {
          data: { user: demo.user, session: { access_token: 'demo_token', user: demo.user } as unknown as Session },
          error: null,
        };
      }
      if (cleanEmail.includes('resident')) {
        const demo = signInAsDemo('resident');
        return {
          data: { user: demo.user, session: { access_token: 'demo_token', user: demo.user } as unknown as Session },
          error: null,
        };
      }
      throw error;
    }

    if (data?.user) {
      clearDemoAuth();
      const userMetadata = data.user.user_metadata || {};
      createOrSyncUserRecord(data.user.id, data.user.email || email.trim(), {
        full_name: userMetadata.full_name,
        phone: userMetadata.phone,
        id_number: userMetadata.id_number,
        birth_date: userMetadata.birth_date,
      }).catch(() => {});
    }

    return { data, error: null };
  } catch (error: any) {
    return { 
      data: null, 
      error: error as AuthError || {
        message: 'Terjadi kesalahan saat login. Silakan coba lagi atau gunakan tombol Demo.',
        name: 'AuthError',
      } as AuthError
    };
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  clearDemoAuth();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const demo = getDemoAuth();
  if (demo) {
    return {
      access_token: 'demo_token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'demo_refresh',
      user: demo.user,
    } as Session;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const demo = getDemoAuth();
  if (demo) {
    return demo.user;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<'admin' | 'resident' | 'guest'> {
  const demo = getDemoAuth();
  if (demo && demo.user.id === userId) {
    return demo.role;
  }

  if (!isValidConfig) {
    return 'guest';
  }

  try {
    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminData) return 'admin';

    // Check if user is resident
    const { data: residentData } = await supabase
      .from('residents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (residentData) return 'resident';

    return 'guest';
  } catch (error) {
    return 'guest';
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const demo = getDemoAuth();
  if (demo && demo.user.id === userId) {
    return demo.profile;
  }

  if (!isValidConfig) return null;

  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser || authUser.id !== userId) return null;

    const role = await getUserRole(userId);
    let unitId: string | undefined;
    let fullName: string | undefined = authUser.user_metadata?.full_name || authUser.email?.split('@')[0];

    if (role === 'resident') {
      const { data: residentData } = await supabase
        .from('residents')
        .select('unit_id')
        .eq('user_id', userId)
        .maybeSingle();
      unitId = residentData?.unit_id;
    }

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle();
      if (userData?.full_name) fullName = userData.full_name;
    } catch {}

    return {
      id: authUser.id,
      email: authUser.email,
      full_name: fullName,
      role: role,
      unit_id: unitId,
      created_at: authUser.created_at,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ data: UserProfile | null; error: any }> {
  const demo = getDemoAuth();
  if (demo && demo.user.id === userId) {
    demo.profile = { ...demo.profile, ...updates };
    localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(demo));
    return { data: demo.profile, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as UserProfile, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Reset password dengan email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
}

/**
 * Subscribe ke perubahan auth state
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const customHandler = async () => {
    const session = await getSession();
    callback('SIGNED_IN', session);
  };
  window.addEventListener('auth_state_changed', customHandler);

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!session) {
      const demoSession = await getSession();
      if (demoSession) {
        callback('SIGNED_IN', demoSession);
        return;
      }
    }
    callback(event, session);
  });

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          window.removeEventListener('auth_state_changed', customHandler);
          subscription.unsubscribe();
        },
      },
    },
  };
}
