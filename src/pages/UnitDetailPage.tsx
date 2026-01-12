import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUnitWithPhotos, getAllUnits } from '../lib/database';
import type { Unit, UnitPhoto } from '../lib/types/database';
import { 
  Loader2, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle
} from 'lucide-react';

interface UnitWithPhotos {
  unit: Unit;
  photos: UnitPhoto[];
}

export function UnitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unitData, setUnitData] = useState<UnitWithPhotos | null>(null);
  const [relatedUnits, setRelatedUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (id) {
      loadUnitData();
    }
  }, [id]);

  const loadUnitData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Load unit with photos
      const { data: unitDataResult, error: unitError } = await getUnitWithPhotos(id);

      if (unitError) throw unitError;

      if (!unitDataResult) {
        setError('Unit not found');
        setLoading(false);
        return;
      }

      setUnitData(unitDataResult);

      // Load related units (same type, different unit)
      const { data: allUnits, error: unitsError } = await getAllUnits({
        type: unitDataResult.unit.unit_type,
        status: 'available',
      });

      if (!unitsError && allUnits) {
        const related = allUnits
          .filter(u => u.id !== id)
          .slice(0, 3);
        setRelatedUnits(related);
      }
    } catch (err: any) {
      console.error('Error loading unit data:', err);
      setError('Gagal memuat data unit. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!unitData) return;
    const photos = unitData.photos;
    if (photos.length === 0) return;

    if (direction === 'prev') {
      setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    } else {
      setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Memuat data unit...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !unitData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="card p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-primary mb-2">Unit Not Found</h2>
            <p className="text-text-secondary mb-6">{error || 'Unit tidak ditemukan'}</p>
            <Link to="/catalogue" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Katalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { unit, photos } = unitData;
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];
  const statusColors = {
    available: 'bg-green-100 text-green-700',
    occupied: 'bg-red-100 text-red-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
  };
  const statusLabels = {
    available: 'Tersedia',
    occupied: 'Tersewa',
    maintenance: 'Maintenance',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Back Button */}
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Photo */}
            {primaryPhoto && (
              <div className="card p-0 overflow-hidden">
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={primaryPhoto.photo_url}
                    alt={unit.unit_number}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openLightbox(photos.indexOf(primaryPhoto))}
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${statusColors[unit.status]}`}>
                    {statusLabels[unit.status]}
                  </div>
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {photos.length > 1 && (
              <div className="card p-6">
                <h3 className="text-primary font-semibold mb-4">Photo Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      onClick={() => openLightbox(index)}
                      className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-primary transition-colors"
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unit Details */}
            <div className="card p-6">
              <h3 className="text-primary font-semibold mb-4">Unit Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-text-secondary mb-1">
                    <Maximize className="w-4 h-4" />
                    <span className="text-sm">Size</span>
                  </div>
                  <p className="text-primary font-medium">{unit.size_sqm} m²</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-text-secondary mb-1">
                    <Bed className="w-4 h-4" />
                    <span className="text-sm">Bedrooms</span>
                  </div>
                  <p className="text-primary font-medium">{unit.bedrooms}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-text-secondary mb-1">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm">Bathrooms</span>
                  </div>
                  <p className="text-primary font-medium">{unit.bathrooms}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-text-secondary mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Floor</span>
                  </div>
                  <p className="text-primary font-medium">Floor {unit.floor}</p>
                </div>
              </div>

              {unit.orientation && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-text-secondary mb-1">
                    <span className="text-sm">Orientation</span>
                  </div>
                  <p className="text-primary font-medium capitalize">{unit.orientation}</p>
                </div>
              )}

              {unit.features && unit.features.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-primary font-medium mb-3">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {unit.features.map((feature: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {typeof feature === 'string' ? feature : feature.name || feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Floor Plan */}
            {unit.floor_plan_url && (
              <div className="card p-6">
                <h3 className="text-primary font-semibold mb-4">Floor Plan</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={unit.floor_plan_url}
                    alt="Floor Plan"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Info */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="mb-6">
                <h2 className="text-primary text-2xl font-bold mb-2">Unit {unit.unit_number}</h2>
                <p className="text-text-secondary text-lg capitalize">{unit.unit_type}</p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-accent">{formatCurrency(unit.monthly_rent)}</span>
                  <span className="text-text-secondary">/bulan</span>
                </div>
                {unit.yearly_booking_price && (
                  <p className="text-sm text-text-secondary">
                    Atau {formatCurrency(unit.yearly_booking_price)}/tahun
                  </p>
                )}
                {unit.deposit_required > 0 && (
                  <p className="text-sm text-text-secondary mt-2">
                    Deposit: {formatCurrency(unit.deposit_required)}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-primary font-medium">{statusLabels[unit.status]}</span>
                </div>
                <p className="text-sm text-text-secondary">
                  {unit.status === 'available' 
                    ? 'Unit ini tersedia untuk disewa' 
                    : unit.status === 'occupied'
                    ? 'Unit ini sedang disewa'
                    : 'Unit sedang dalam maintenance'}
                </p>
              </div>

              {/* Booking CTA */}
              <div className="space-y-3">
                {unit.status === 'available' ? (
                  <>
                    <Link
                      to="/register"
                      state={{ selected_unit_id: unit.id }}
                      className="btn-primary w-full text-center inline-block"
                    >
                      Book Now
                    </Link>
                    <Link
                      to="/contact"
                      className="btn-outline w-full text-center inline-block"
                    >
                      Contact Us
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/contact"
                    className="btn-primary w-full text-center inline-block"
                  >
                    Contact for Availability
                  </Link>
                )}
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">Available for viewing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">Furnished</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Units */}
        {relatedUnits.length > 0 && (
          <div className="mt-12">
            <h3 className="text-primary text-2xl font-bold mb-6">Related Units</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedUnits.map((relatedUnit) => (
                <Link
                  key={relatedUnit.id}
                  to={`/unit/${relatedUnit.id}`}
                  className="card card-hover"
                >
                  <div className="relative h-48 overflow-hidden">
                    {/* You would need to fetch photos for related units or use a placeholder */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-medium ${statusColors[relatedUnit.status]}`}>
                      {statusLabels[relatedUnit.status]}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-primary font-semibold mb-1">Unit {relatedUnit.unit_number}</h4>
                    <p className="text-text-secondary text-sm capitalize mb-2">{relatedUnit.unit_type}</p>
                    <p className="text-accent font-semibold">{formatCurrency(relatedUnit.monthly_rent)}/bulan</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && photos.length > 0 && (
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
                src={photos[selectedPhotoIndex].photo_url}
                alt={photos[selectedPhotoIndex].caption || `Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>

            {photos[selectedPhotoIndex].caption && (
              <div className="text-center text-white">
                <p className="text-lg font-medium">{photos[selectedPhotoIndex].caption}</p>
              </div>
            )}

            <div className="text-center text-gray-400 text-sm mt-2">
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




