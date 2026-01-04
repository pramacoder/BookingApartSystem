import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="text-xl">GreenView</div>
                <div className="text-sm text-tertiary">Apartment</div>
              </div>
            </div>
            <p className="text-tertiary text-sm mb-4">
              Modern living space dengan fasilitas lengkap di lokasi strategis Jakarta Selatan.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-tertiary hover:text-accent transition-colors text-sm">Home</Link></li>
              <li><Link to="/catalogue" className="text-tertiary hover:text-accent transition-colors text-sm">Catalogue</Link></li>
              <li><Link to="/facilities" className="text-tertiary hover:text-accent transition-colors text-sm">Facilities</Link></li>
              <li><Link to="/gallery" className="text-tertiary hover:text-accent transition-colors text-sm">Gallery</Link></li>
              <li><Link to="/about" className="text-tertiary hover:text-accent transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-tertiary hover:text-accent transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* For Residents */}
          <div>
            <h4 className="mb-4">For Residents</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-tertiary hover:text-accent transition-colors text-sm">Login</Link></li>
              <li><Link to="/register" className="text-tertiary hover:text-accent transition-colors text-sm">Register</Link></li>
              <li><Link to="/resident/dashboard" className="text-tertiary hover:text-accent transition-colors text-sm">Dashboard</Link></li>
              <li><Link to="/resident/payment" className="text-tertiary hover:text-accent transition-colors text-sm">Payment Center</Link></li>
              <li><Link to="/resident/bookings" className="text-tertiary hover:text-accent transition-colors text-sm">Facility Booking</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-tertiary text-sm">
                  Jl. Sudirman No. 123<br />
                  Jakarta Selatan 12920
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-tertiary text-sm">+62 21 1234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-tertiary text-sm">info@greenview.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-tertiary">Working Hours:</p>
              <p className="text-sm text-white">Mon - Fri: 08:00 - 17:00</p>
              <p className="text-sm text-white">Sat: 09:00 - 15:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-tertiary text-sm">
            © 2024 GreenView Apartment. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-tertiary hover:text-accent transition-colors text-sm">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-tertiary hover:text-accent transition-colors text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
