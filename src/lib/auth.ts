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
      // Error other than "not found", return base username
      return baseUsername;
    }

    if (!data) {
      // Username is available
      return username;
    }

    // Username taken, try with number suffix
    attempts++;
    username = `${baseUsername}${attempts}`;
  }

  // Fallback: use timestamp
  return `${baseUsername}${Date.now().toString().slice(-6)}`;
}

/**
 * Create or sync user record in users table
 */
async function createOrSyncUserRecord(userId: string, email: string, metadata?: Record<string, any>) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingUser) {
      // User exists, update if needed
      const updates: any = {};
      if (metadata?.full_name) updates.full_name = metadata.full_name;
      if (metadata?.phone) updates.phone = metadata.phone;
      if (metadata?.id_number) updates.id_number = metadata.id_number;
      if (metadata?.birth_date) updates.birth_date = metadata.birth_date;

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user record:', updateError);
        }
      }
      return { error: null };
    }

    // Generate unique username from email
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40); // Limit length
    const username = baseUsername.length > 0 
      ? await generateUniqueUsername(baseUsername)
      : `user_${userId.substring(0, 8)}`; // Fallback if email parsing fails

    // Create new user record
    const { data: insertData, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        username: username,
        password_hash: '', // Not needed, Supabase Auth handles this
        full_name: metadata?.full_name || null,
        phone: metadata?.phone || null,
        id_number: metadata?.id_number || null,
        birth_date: metadata?.birth_date || null,
        role: 'guest', // Default role, will be updated when assigned to resident/admin
        is_active: true,
        is_verified: false,
      })
      .select();

    if (error) {
      console.error('Error inserting user record:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      
      // If user already exists (race condition), that's okay
      if (error.code === '23505') { // Unique violation
        console.log('User record already exists (race condition)');
        return { error: null };
      }
      
      // If RLS policy blocks insert, log it
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        console.error('RLS Policy Error: User tidak memiliki permission untuk INSERT ke tabel users');
        console.error('Pastikan policy INSERT sudah dibuat di Supabase untuk tabel users');
        // Don't throw, allow auth to continue
        return { error: { message: 'RLS policy error: ' + error.message, code: error.code } };
      }
      
      throw error;
    }
    
    console.log('User record created successfully:', insertData);

    return { error: null };
  } catch (error: any) {
    console.error('Error creating/syncing user record:', error);
    // Don't fail auth if user record creation fails
    // User can still login via Supabase Auth
    return { error };
  }
}

/**
 * Sign up dengan email dan password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  // Check configuration first
  if (!isValidConfig) {
    return {
      data: null,
      error: {
        message: configError || 'Supabase tidak terkonfigurasi dengan benar. Pastikan file .env sudah di-setup.',
        name: 'ConfigurationError',
      } as AuthError,
    };
  }

  try {
    // Validate input
    if (!email || !email.trim()) {
      return {
        data: null,
        error: { message: 'Email harus diisi', name: 'ValidationError' } as AuthError,
      };
    }

    if (!password || password.length < 6) {
      return {
        data: null,
        error: { message: 'Password harus minimal 6 karakter', name: 'ValidationError' } as AuthError,
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return {
        data: null,
        error: { message: 'Format email tidak valid', name: 'ValidationError' } as AuthError,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata || {},
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      console.error('SignUp error:', error);
      // Handle specific errors
      if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
        return {
          data: null,
          error: {
            message: 'Gagal terhubung ke server. Pastikan:\n1. Koneksi internet aktif\n2. URL Supabase benar\n3. Supabase project aktif',
            name: 'NetworkError',
          } as AuthError,
        };
      }
      
      // Handle user already exists
      if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
        return {
          data: null,
          error: {
            message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.',
            name: 'AuthError',
          } as AuthError,
        };
      }
      
      throw error;
    }

    // Create user record in users table if signup successful
    if (data?.user) {
      console.log('Signup successful, creating user record for:', data.user.id);
      const syncResult = await createOrSyncUserRecord(data.user.id, email.trim(), metadata);
      if (syncResult.error) {
        console.error('User record sync failed:', syncResult.error);
        console.error('User masih bisa login via Supabase Auth, tapi record di tabel users mungkin tidak ada');
        // Continue anyway - user can still login via Supabase Auth
      } else {
        console.log('User record created successfully in users table');
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected signUp error:', error);
    return { 
      data: null, 
      error: error as AuthError || {
        message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.',
        name: 'UnknownError',
      } as AuthError
    };
  }
}

/**
 * Sign in dengan email dan password
 */
export async function signIn(email: string, password: string) {
  // Check configuration first
  if (!isValidConfig) {
    return {
      data: null,
      error: {
        message: configError || 'Supabase tidak terkonfigurasi dengan benar. Pastikan file .env sudah di-setup.',
        name: 'ConfigurationError',
      } as AuthError,
    };
  }

  try {
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('SignIn error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Handle specific errors
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        return {
          data: null,
          error: {
            message: 'Gagal terhubung ke server. Pastikan:\n1. Koneksi internet aktif\n2. URL Supabase benar\n3. Supabase project aktif',
            name: 'NetworkError',
          } as AuthError,
        };
      }
      
      // Handle invalid credentials
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid_credentials')) {
        return {
          data: null,
          error: {
            message: 'Email atau password salah. Silakan cek kembali.\n\nTips:\n• Pastikan email sudah terverifikasi\n• Cek apakah email dan password benar\n• Jika baru registrasi, cek email untuk verifikasi',
            name: 'AuthError',
          } as AuthError,
        };
      }
      
      // Handle unconfirmed email
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed') || error.status === 400) {
        return {
          data: null,
          error: {
            message: 'Email belum terverifikasi. Silakan cek email Anda untuk link verifikasi.\n\nJika tidak menerima email:\n• Cek folder spam\n• Pastikan email yang digunakan benar\n• Atau nonaktifkan email verification di Supabase Dashboard',
            name: 'AuthError',
          } as AuthError,
        };
      }

      throw error;
    }
    
    console.log('Login successful for user:', data.user?.id);

    // Sync user record to users table if login successful
    if (data?.user) {
      // Get user metadata from auth
      const authUser = data.user;
      const userMetadata = authUser.user_metadata || {};
      
      // Sync user record (create if not exists, update if exists)
      // Do this asynchronously so it doesn't block login
      createOrSyncUserRecord(
        authUser.id,
        authUser.email || email.trim(),
        {
          full_name: userMetadata.full_name,
          phone: userMetadata.phone,
          id_number: userMetadata.id_number,
          birth_date: userMetadata.birth_date,
        }
      ).catch((err) => {
        console.warn('User record sync failed after login:', err);
        // Don't block login if sync fails
      });
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected signIn error:', error);
    return { 
      data: null, 
      error: error as AuthError || {
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
        name: 'UnknownError',
      } as AuthError
    };
  }
}

/**
 * Sign out user
 */
export async function signOut() {
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
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get user role dari database (check admins atau residents table)
 */
export async function getUserRole(userId: string): Promise<'admin' | 'resident' | 'guest'> {
  if (!isValidConfig) {
    console.warn('Cannot check user role: Supabase not configured');
    return 'guest';
  }

  try {
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminError && adminError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking admin role:', adminError);
    }

    if (adminData) {
      return 'admin';
    }

    // Check if user is resident
    const { data: residentData, error: residentError } = await supabase
      .from('residents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (residentError && residentError.code !== 'PGRST116') {
      console.error('Error checking resident role:', residentError);
    }

    if (residentData) {
      return 'resident';
    }

    return 'guest';
  } catch (error) {
    console.error('Error checking user role:', error);
    return 'guest';
  }
}

/**
 * Get user profile dari database (combine users, residents, admins)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isValidConfig) {
    console.warn('Cannot get user profile: Supabase not configured');
    return null;
  }

  try {
    // Get user data from auth.users (Supabase Auth) instead of users table
    // Because Supabase Auth manages its own users table
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser || authUser.id !== userId) {
      return null;
    }

    // Check role
    const role = await getUserRole(userId);

    // Get additional data based on role
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

    // Try to get from users table if exists
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle();
      
      if (userData) {
        fullName = userData.full_name || fullName;
      }
    } catch (err) {
      // Users table might not exist or have RLS blocking, use auth user data
      console.log('Could not fetch from users table, using auth user data');
    }

    return {
      id: authUser.id,
      email: authUser.email,
      full_name: fullName,
      role: role,
      unit_id: unitId,
      created_at: authUser.created_at,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
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
  try {
    const { data, error } = await supabase
      .from('profiles')
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
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

