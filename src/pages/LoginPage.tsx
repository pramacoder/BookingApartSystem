import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';
import { signIn, getUserRole } from '../lib/auth';
import { checkSupabaseConfig } from '../lib/supabase-config';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<{ isValid: boolean; issues: string[] } | null>(null);

  useEffect(() => {
    const config = checkSupabaseConfig();
    setConfigStatus(config);
    if (!config.isValid) {
      setError('Konfigurasi Supabase belum lengkap. Pastikan file .env sudah di-setup dengan benar.');
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign in dengan Supabase
      const { data, error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        // Format error message untuk display yang lebih baik
        let errorMessage = signInError.message || 'Login failed. Please check your credentials.';
        
        // Handle specific error types
        if (signInError.name === 'ConfigurationError') {
          errorMessage = 'Konfigurasi Supabase belum lengkap. Pastikan file .env sudah di-setup dengan benar.';
        } else if (signInError.name === 'NetworkError' || errorMessage.includes('fetch') || errorMessage.includes('network')) {
          errorMessage = 'Gagal terhubung ke server. Pastikan:\n• Koneksi internet aktif\n• URL Supabase benar\n• Supabase project aktif';
        } else if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah. Silakan cek kembali.';
        } else if (errorMessage.includes('Email not confirmed') || errorMessage.includes('email_not_confirmed')) {
          errorMessage = 'Email belum terverifikasi. Silakan cek email Anda untuk link verifikasi.';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'Email sudah terdaftar. Silakan login.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!data?.user) {
        setError('Login gagal. User tidak ditemukan. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      // Small delay to ensure user record is synced
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get user role
      const role = await getUserRole(data.user.id);

      // Redirect berdasarkan role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'resident') {
        navigate('/resident/dashboard');
      } else {
        // User belum punya role, redirect ke profile untuk setup
        navigate('/resident/profile');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Terjadi kesalahan saat login. Silakan coba lagi.';
      
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        errorMessage = 'Gagal terhubung ke server. Pastikan koneksi internet aktif dan Supabase URL benar.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image */}
      <div
        className="hidden lg:block lg:w-1/2 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjU0MzQyNDV8MA&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90" />
        <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-white mb-4 text-center">Welcome to GreenView</h2>
          <p className="text-tertiary text-center max-w-md">
            Manage your apartment life with ease. Access payments, bookings, and community updates all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-xl text-primary">GreenView</div>
              <div className="text-xs text-text-secondary">Apartment</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-primary mb-2">Login to Your Account</h2>
            <p className="text-text-secondary">Welcome back! Please enter your credentials</p>
          </div>

          {/* Configuration Warning */}
          {configStatus && !configStatus.isValid && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Konfigurasi Supabase belum lengkap</p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                    {configStatus.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-yellow-700 mt-2">
                    Pastikan file <code className="bg-yellow-100 px-1 rounded">.env</code> di root project sudah diisi dengan benar.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            {/* Email Field */}
            <div>
              <label className="block text-sm text-primary mb-2">Alamat Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-12"
                  required
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Masukkan alamat email yang terdaftar
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm text-primary mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              <p className="text-xs text-text-secondary mt-1">
                Masukkan password Anda
              </p>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-text-secondary">Ingat saya</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-accent transition-colors">
                Lupa Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full ${isLoading && 'opacity-50 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Social Login (Optional) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-text-secondary">Atau lanjutkan dengan</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-primary transition-colors bg-white group">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span className="text-sm text-text-primary group-hover:text-white transition-colors">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-primary transition-colors bg-white group">
                <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
                <span className="text-sm text-text-primary group-hover:text-white transition-colors">Facebook</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary hover:text-accent transition-colors">
                Daftar di sini
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-text-secondary hover:text-primary transition-colors">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
