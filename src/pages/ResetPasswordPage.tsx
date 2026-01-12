import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { updatePassword, getSession } from '../lib/auth';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session (from password reset link)
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          setIsValidToken(true);
        } else {
          // Check URL hash for access token (Supabase password reset)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            // Session will be set automatically by Supabase
            // Wait a bit and check again
            setTimeout(async () => {
              const newSession = await getSession();
              setIsValidToken(!!newSession);
            }, 500);
          } else {
            setIsValidToken(false);
            setError('Link reset password tidak valid atau sudah expired. Silakan request link baru.');
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setIsValidToken(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password.trim()) {
      setError('Password harus diisi');
      return;
    }

    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        let errorMessage = updateError.message || 'Gagal mengupdate password. Silakan coba lagi.';
        
        if (updateError.message?.includes('fetch') || updateError.message?.includes('network')) {
          errorMessage = 'Gagal terhubung ke server. Pastikan koneksi internet aktif.';
        } else if (updateError.message?.includes('session') || updateError.message?.includes('token')) {
          errorMessage = 'Link reset password tidak valid atau sudah expired. Silakan request link baru.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Password berhasil diubah! Silakan login dengan password baru.'
          }
        });
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memvalidasi link reset password...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-primary mb-2">Link Tidak Valid</h2>
          <p className="text-text-secondary mb-6">
            Link reset password tidak valid atau sudah expired. Silakan request link baru.
          </p>
          <Link to="/forgot-password" className="btn-primary inline-block mb-4">
            Request Link Baru
          </Link>
          <div>
            <Link to="/login" className="text-sm text-text-secondary hover:text-primary transition-colors">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-primary mb-2">Password Berhasil Diubah!</h2>
          <p className="text-text-secondary mb-6">
            Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full card p-8">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>

        <div className="mb-6">
          <h2 className="text-primary mb-2">Reset Password</h2>
          <p className="text-text-secondary">
            Masukkan password baru Anda. Pastikan password minimal 6 karakter.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-primary mb-2">Password Baru</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password baru (min. 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-primary mb-2">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary w-full ${isLoading && 'opacity-50 cursor-not-allowed'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengupdate Password...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}




