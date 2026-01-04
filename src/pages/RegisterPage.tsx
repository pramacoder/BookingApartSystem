import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { signUp } from '../lib/auth';
import { checkSupabaseConfig } from '../lib/supabase-config';

export function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [configStatus, setConfigStatus] = useState<{ isValid: boolean; issues: string[] } | null>(null);

  useEffect(() => {
    const config = checkSupabaseConfig();
    setConfigStatus(config);
    if (!config.isValid) {
      setError('Konfigurasi Supabase belum lengkap. Pastikan file .env sudah di-setup dengan benar.');
    }
  }, []);
  
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    full_name: '',
    email: '',
    phone: '',
    id_number: '',
    birth_date: '',
    
    // Step 2: Account Details
    password: '',
    confirmPassword: '',
    
    // Step 3: Terms
    agreeToTerms: false,
  });

  const validateStep1 = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.agreeToTerms) {
      setError('Anda harus menyetujui syarat & ketentuan');
      return;
    }

    setIsLoading(true);

    try {
      // Sign up dengan Supabase
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.full_name,
          phone: formData.phone,
          id_number: formData.id_number,
          birth_date: formData.birth_date,
        }
      );

      if (signUpError) {
        // Format error message untuk display yang lebih baik
        let errorMessage = signUpError.message || 'Registration failed. Please try again.';
        
        // Handle specific error types
        if (signUpError.name === 'ConfigurationError') {
          errorMessage = 'Konfigurasi Supabase belum lengkap. Pastikan file .env sudah di-setup dengan benar.';
        } else if (signUpError.name === 'NetworkError' || errorMessage.includes('fetch') || errorMessage.includes('network')) {
          errorMessage = 'Gagal terhubung ke server. Pastikan:\n• Koneksi internet aktif\n• URL Supabase benar\n• Supabase project aktif';
        } else if (errorMessage.includes('User already registered') || errorMessage.includes('already registered')) {
          errorMessage = 'Email sudah terdaftar. Silakan login atau gunakan email lain.';
        } else if (errorMessage.includes('Password') && errorMessage.includes('6')) {
          errorMessage = 'Password tidak memenuhi syarat. Minimal 6 karakter.';
        } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
          errorMessage = 'Format email tidak valid.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        setSuccess(true);
        setIsLoading(false);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun sebelum login.' 
            } 
          });
        }, 3000);
      } else {
        setError('Registrasi gagal. Silakan coba lagi.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Terjadi kesalahan saat registrasi. Silakan coba lagi.';
      
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        errorMessage = 'Gagal terhubung ke server. Pastikan koneksi internet aktif dan Supabase URL benar.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-primary mb-2">Registrasi Berhasil!</h2>
          <p className="text-text-secondary mb-6">
            Silakan cek email Anda untuk verifikasi akun sebelum login.
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
      <div className="max-w-2xl w-full card p-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Info Pribadi</span>
            <span>Detail Akun</span>
            <span>Konfirmasi</span>
          </div>
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

        <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
          <div>
            <h2 className="text-primary mb-2">Informasi Pribadi</h2>
            <p className="text-text-secondary">Silakan isi data pribadi Anda</p>
          </div>

              <div>
                <label className="block text-sm text-primary mb-2">Nama Lengkap *</label>
                <div className="relative">
                  <User className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Alamat Email *</label>
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
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Nomor Telepon *</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+62 812 3456 7890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Nomor KTP/NIK</label>
                  <input
                    type="text"
                    placeholder="Nomor KTP/NIK"
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-primary mb-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Account Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
          <div>
            <h2 className="text-primary mb-2">Detail Akun</h2>
            <p className="text-text-secondary">Buat password yang aman untuk akun Anda</p>
          </div>

              <div>
                <label className="block text-sm text-primary mb-2">Password *</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password (min. 6 karakter)"
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
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Konfirmasi Password *</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Konfirmasi password Anda"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
          <div>
            <h2 className="text-primary mb-2">Review & Konfirmasi</h2>
            <p className="text-text-secondary">Silakan review informasi Anda dan setujui syarat & ketentuan</p>
          </div>

              <div className="bg-gray-50 p-6 rounded-xl space-y-3">
                <div>
                  <span className="text-sm text-text-secondary">Nama Lengkap:</span>
                  <p className="text-primary font-medium">{formData.full_name}</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Email:</span>
                  <p className="text-primary font-medium">{formData.email}</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Telepon:</span>
                  <p className="text-primary font-medium">{formData.phone}</p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="w-5 h-5 text-primary rounded mt-0.5"
                  required
                />
                <span className="text-sm text-text-secondary">
                  Saya setuju dengan{' '}
                  <Link to="/terms" className="text-primary hover:text-accent">
                    Syarat & Ketentuan
                  </Link>{' '}
                  dan{' '}
                  <Link to="/privacy" className="text-primary hover:text-accent">
                    Kebijakan Privasi
                  </Link>
                </span>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline"
                disabled={isLoading}
              >
                Kembali
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                Lanjut
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mendaftar...
                  </div>
                ) : (
                  'Daftar'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary hover:text-accent transition-colors">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

