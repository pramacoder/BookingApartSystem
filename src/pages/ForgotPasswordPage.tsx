import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../lib/auth';
import { checkSupabaseConfig } from '../lib/supabase-config';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [configStatus] = useState(() => checkSupabaseConfig());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email.trim()) {
        setError('Email harus diisi');
        setIsLoading(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Format email tidak valid');
        setIsLoading(false);
        return;
      }

      const { error: resetError } = await resetPassword(email.trim());

      if (resetError) {
        let errorMessage = resetError.message || 'Gagal mengirim email reset password. Silakan coba lagi.';
        
        if (resetError.message?.includes('fetch') || resetError.message?.includes('network')) {
          errorMessage = 'Gagal terhubung ke server. Pastikan koneksi internet aktif.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-primary mb-2">Email Terkirim!</h2>
          <p className="text-text-secondary mb-6">
            Kami telah mengirimkan link untuk reset password ke email <strong>{email}</strong>. 
            Silakan cek inbox atau folder spam Anda.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Kembali ke Login
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
          <h2 className="text-primary mb-2">Lupa Password?</h2>
          <p className="text-text-secondary">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
          </p>
        </div>

        {/* Configuration Warning */}
        {configStatus && !configStatus.isValid && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-2">Konfigurasi Supabase belum lengkap</p>
                <p className="text-xs text-yellow-700">
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
          <div>
            <label className="block text-sm text-primary mb-2">Alamat Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-12"
                required
              />
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
                Mengirim...
              </div>
            ) : (
              'Kirim Link Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Ingat password Anda?{' '}
            <Link to="/login" className="text-primary hover:text-accent transition-colors">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}




