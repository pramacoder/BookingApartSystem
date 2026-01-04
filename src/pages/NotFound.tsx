import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Building2 } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div className="text-left">
            <div className="text-2xl text-primary">GreenView</div>
            <div className="text-sm text-text-secondary">Apartment</div>
          </div>
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-primary mb-4" style={{ fontSize: '120px', lineHeight: 1 }}>
            404
          </h1>
          <div className="w-32 h-1 bg-accent mx-auto mb-8 rounded-full" />
        </div>

        {/* Error Message */}
        <div className="card p-8 mb-8">
          <h2 className="text-primary mb-4">Oops! Page Not Found</h2>
          <p className="text-text-secondary mb-6 text-lg">
            Maaf, halaman yang Anda cari tidak ditemukan. 
            Mungkin halaman telah dipindahkan atau URL yang Anda masukkan salah.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari unit, fasilitas, atau halaman..."
                className="input-field pl-12 w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary inline-flex items-center gap-2 justify-center"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-outline inline-flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/catalogue"
            className="card p-6 hover:shadow-xl transition-all group text-center"
          >
            <Building2 className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm text-primary">Units</p>
          </Link>
          
          <Link
            to="/facilities"
            className="card p-6 hover:shadow-xl transition-all group text-center"
          >
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🏊</span>
            <p className="text-sm text-primary">Facilities</p>
          </Link>
          
          <Link
            to="/contact"
            className="card p-6 hover:shadow-xl transition-all group text-center"
          >
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">📞</span>
            <p className="text-sm text-primary">Contact</p>
          </Link>
          
          <Link
            to="/login"
            className="card p-6 hover:shadow-xl transition-all group text-center"
          >
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">👤</span>
            <p className="text-sm text-primary">Login</p>
          </Link>
        </div>

        {/* Report Link */}
        <div className="mt-8">
          <p className="text-text-secondary text-sm">
            Menemukan link yang rusak?{' '}
            <Link to="/contact" className="text-primary hover:text-accent transition-colors">
              Laporkan di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
