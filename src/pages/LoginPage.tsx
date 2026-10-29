import { Logo } from '../components/Logo';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, AlertCircle, Home, UserCheck, ShieldCheck } from 'lucide-react';
import { signIn, getUserRole, signInAsDemo } from '../lib/auth';
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
      setError('Konfigurasi Supabase belum lengkap. Anda tetap dapat menggunakan Demo Login di bawah.');
    }
  }, []);

  const handleDemoLogin = (role: 'admin' | 'resident') => {
    signInAsDemo(role);
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/resident/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        let errorMessage = signInError.message || 'Login failed. Please check your credentials.';
        if (signInError.name === 'ConfigurationError') {
          errorMessage = 'Konfigurasi Supabase belum lengkap. Silakan gunakan Demo Login di bawah untuk preview.';
        } else if (signInError.name === 'NetworkError' || errorMessage.includes('fetch') || errorMessage.includes('network')) {
          errorMessage = 'Gagal terhubung ke server Supabase. Anda dapat menggunakan tombol Demo Login untuk mengakses sistem.';
        }
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!data?.user) {
        setError('Login gagal. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      const role = await getUserRole(data.user.id);
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi atau gunakan Demo Login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" subtitle="Apartment Management" to="/" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Selamat Datang Kembali</h2>
          <p className="text-text-secondary text-sm">Masuk ke akun GreenView Apartment Anda</p>
        </div>

        {/* Card */}
        <div className="card p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
          {/* Quick Demo Access Box */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Akses Cepat (Demo Mode)</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Klik salah satu tombol di bawah untuk langsung mencoba semua fitur tanpa setup database tambahan:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-3 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('resident')}
                className="px-3 py-2 text-xs font-semibold bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Home className="w-4 h-4" />
                Demo Resident
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-800 whitespace-pre-line">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@greenview.com / resident@greenview.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-12 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-12 pr-12 text-sm"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-xs text-text-secondary">Ingat saya</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                'Masuk dengan Akun'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-text-secondary text-xs">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-text-secondary hover:text-primary transition-colors">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
