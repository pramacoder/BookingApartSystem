import { useState } from 'react';
import { mockUnits } from '../data/mockData';
import { UnitCard } from '../components/UnitCard';
import { Grid3x3, List, SlidersHorizontal } from 'lucide-react';

export function CataloguePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priceRange: 'all',
    floor: 'all'
  });

  const filteredUnits = mockUnits.filter(unit => {
    if (filters.type !== 'all' && unit.type !== filters.type) return false;
    if (filters.status !== 'all' && unit.status !== filters.status) return false;
    if (filters.priceRange === 'low' && unit.monthlyRent > 5000000) return false;
    if (filters.priceRange === 'mid' && (unit.monthlyRent < 5000000 || unit.monthlyRent > 7000000)) return false;
    if (filters.priceRange === 'high' && unit.monthlyRent < 7000000) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-primary text-white py-12">
        <div className="container-custom">
          <h1 className="text-white mb-2">Unit Catalogue</h1>
          <p className="text-tertiary">Temukan unit apartemen yang sesuai dengan kebutuhan Anda</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h3 className="text-primary">Filter</h3>
              </div>

              <div className="space-y-6">
                {/* Tipe Unit */}
                <div>
                  <label className="block text-sm text-text-primary mb-2">Tipe Unit</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="Studio">Studio</option>
                    <option value="1 Bedroom">1 Bedroom</option>
                    <option value="2 Bedroom">2 Bedroom</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-text-primary mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="all">Semua Status</option>
                    <option value="available">Tersedia</option>
                    <option value="occupied">Tersewa</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm text-text-primary mb-2">Harga per Bulan</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="all">Semua Harga</option>
                    <option value="low">&lt; Rp 5.000.000</option>
                    <option value="mid">Rp 5.000.000 - Rp 7.000.000</option>
                    <option value="high">&gt; Rp 7.000.000</option>
                  </select>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => setFilters({ type: 'all', status: 'all', priceRange: 'all', floor: 'all' })}
                  className="w-full px-4 py-2 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-text-secondary">
                Menampilkan <span className="text-primary">{filteredUnits.length}</span> unit
              </p>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select className="input-field text-sm py-2">
                  <option>Sort by: Default</option>
                  <option>Harga: Rendah ke Tinggi</option>
                  <option>Harga: Tinggi ke Rendah</option>
                  <option>Ukuran: Kecil ke Besar</option>
                  <option>Ukuran: Besar ke Kecil</option>
                </select>

                {/* View Toggle */}
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      view === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      view === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Units Grid/List */}
            {filteredUnits.length > 0 ? (
              <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
                {filteredUnits.map((unit) => (
                  <UnitCard key={unit.id} unit={unit} view={view} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-text-secondary mb-4">Tidak ada unit yang sesuai dengan filter Anda</p>
                <button
                  onClick={() => setFilters({ type: 'all', status: 'all', priceRange: 'all', floor: 'all' })}
                  className="btn-primary"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
