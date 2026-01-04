import { useState } from 'react';
import { mockFacilities } from '../data/mockData';
import { FacilityCard } from '../components/FacilityCard';
import { Grid3x3, SlidersHorizontal } from 'lucide-react';

export function FacilitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Sports', 'Leisure', 'Services', 'Commons'];

  const filteredFacilities = selectedCategory === 'All'
    ? mockFacilities
    : mockFacilities.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-80 flex items-center justify-center text-white"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1757924284732-4189190321cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBneW0lMjBmaXRuZXNzfGVufDF8fHx8MTc2NTQ3MDM2MHww&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-primary/70" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-white mb-4">Premium Facilities</h1>
          <p className="text-tertiary text-lg max-w-2xl mx-auto">
            Nikmati berbagai fasilitas kelas dunia yang dirancang untuk kenyamanan dan gaya hidup aktif Anda
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Category Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Grid3x3 className="w-5 h-5 text-primary" />
              <h3 className="text-primary">Browse by Category</h3>
            </div>
            <p className="text-text-secondary text-sm">
              Menampilkan <span className="text-primary">{filteredFacilities.length}</span> fasilitas
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-text-secondary hover:bg-tertiary/20 hover:text-primary border-2 border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        {filteredFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-text-secondary mb-4">Tidak ada fasilitas dalam kategori ini</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn-primary"
            >
              Show All Facilities
            </button>
          </div>
        )}

        {/* Facilities Rules */}
        <div className="mt-16 card p-8">
          <h3 className="text-primary mb-6 text-center">Facilities Rules & Regulations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-primary mb-4">General Rules</h4>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Wajib menunjukkan kartu resident saat menggunakan fasilitas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Booking harus dilakukan minimal 1 hari sebelumnya</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Maksimal membawa 3 tamu untuk setiap booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Jaga kebersihan dan ketertiban fasilitas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Patuhi jam operasional setiap fasilitas</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-primary mb-4">Cancellation Policy</h4>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Pembatalan gratis jika dilakukan H-2 sebelum booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Pembatalan H-1: dikenakan biaya 50% dari booking fee</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Pembatalan di hari yang sama: tidak ada refund</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>No-show tanpa pemberitahuan: blacklist untuk 1 bulan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
