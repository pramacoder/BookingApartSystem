import { useEffect, useState } from 'react';
import { getAllGalleryPhotos } from '../lib/database';
import type { GalleryPhoto } from '../lib/types/database';
import { Loader2, Image as ImageIcon, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadPhotos();
  }, [filterCategory]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      
      const filters: { category?: string } = {};
      if (filterCategory !== 'all') {
        filters.category = filterCategory;
      }

      const { data: photosData, error: photosError } = await getAllGalleryPhotos(filters);

      if (photosError) throw photosError;

      setPhotos(photosData || []);

      // Extract unique categories
      if (photosData) {
        const uniqueCategories = Array.from(new Set(photosData.map(p => p.category).filter(Boolean))) as string[];
        setCategories(uniqueCategories);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error loading gallery photos:', err);
      setError('Gagal memuat galeri foto. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;

    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex === -1) return;

    if (direction === 'prev') {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
      setSelectedPhoto(photos[prevIndex]);
    } else {
      const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
      setSelectedPhoto(photos[nextIndex]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedPhoto) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigatePhoto('prev');
    if (e.key === 'ArrowRight') navigatePhoto('next');
  };

  useEffect(() => {
    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown as any);
      return () => window.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [selectedPhoto]);

  const filteredPhotos = filterCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === filterCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Memuat galeri foto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-80 flex items-center justify-center text-white"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-primary/70" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-white mb-4">Gallery</h1>
          <p className="text-tertiary text-lg max-w-2xl mx-auto">
            Lihat keindahan dan keunggulan fasilitas kami melalui galeri foto
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Error Message */}
        {error && (
          <div className="card p-4 bg-red-50 border border-red-200 flex items-start gap-3 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="card p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-secondary">Filter by Category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="card p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-primary mb-2">No Photos</h3>
            <p className="text-text-secondary">There are no photos in the gallery at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-all"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Gallery photo'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {photo.is_featured && (
                  <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-xs font-medium">
                    Featured
                  </div>
                )}
                {photo.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium">{photo.caption}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto('prev');
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto('next');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          <div 
            className="max-w-5xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 flex items-center justify-center mb-4">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || 'Gallery photo'}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
            
            {selectedPhoto.caption && (
              <div className="text-center text-white">
                <p className="text-lg font-medium">{selectedPhoto.caption}</p>
                {selectedPhoto.category && (
                  <p className="text-sm text-gray-300 mt-1">{selectedPhoto.category}</p>
                )}
              </div>
            )}

            <div className="text-center text-gray-400 text-sm mt-2">
              {photos.findIndex(p => p.id === selectedPhoto.id) + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




