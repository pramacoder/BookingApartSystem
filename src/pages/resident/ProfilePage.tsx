import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updatePassword } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Loader2, User, Mail, Phone, Lock, Save, AlertCircle, CheckCircle, Eye, EyeOff, X } from 'lucide-react';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user, profile]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProfile = await getUserProfile(user.id);
      
      if (userProfile) {
        setFormData({
          full_name: userProfile.full_name || '',
          phone: '', // Phone might be in users table
          email: userProfile.email || user.email || '',
        });
      } else {
        // Fallback to auth user data
        setFormData({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          phone: user.user_metadata?.phone || '',
          email: user.email || '',
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Gagal memuat data profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      });

      if (updateError) throw updateError;

      // Try to update users table if exists
      try {
        await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
          })
          .eq('id', user.id);
      } catch (err) {
        // Users table might not exist or have RLS blocking
        console.log('Could not update users table, using auth metadata only');
      }

      setSuccess('Profile berhasil diupdate!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Gagal mengupdate profile. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Semua field password harus diisi');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password baru harus minimal 6 karakter');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    try {
      setChangingPassword(true);
      setError(null);
      setSuccess(null);

      // Verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setError('Password saat ini salah');
        setChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await updatePassword(passwordData.newPassword);
      if (updateError) throw updateError;

      setSuccess('Password berhasil diubah!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError('Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-primary mb-2">Profile & Settings</h1>
        <p className="text-text-secondary">Manage your personal information and account settings</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="card p-4 bg-green-50 border border-green-200 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-primary font-semibold">Profile Information</h2>
              <p className="text-sm text-text-secondary">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-primary mb-2">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-primary mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input-field pl-12 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm text-primary mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field pl-12"
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-primary font-semibold">Change Password</h2>
              <p className="text-sm text-text-secondary">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-primary mb-2">Current Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field pl-12 pr-12"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-primary mb-2">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field pl-12 pr-12"
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-primary mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-field pl-12 pr-12"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

