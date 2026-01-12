import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getResidentWithUnit } from '../../lib/database';
import type { Resident, Unit, UnitPhoto } from '../../lib/types/database';
import { Loader2, Home, MapPin, AlertCircle, FileText } from 'lucide-react';

interface ResidentUnitData {
  resident: Resident;
  unit: Unit;
  photos: UnitPhoto[];
}

export function MyUnitPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ResidentUnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: unitData, error: fetchError } = await getResidentWithUnit(user.id);

        if (fetchError) {
          console.error('Error fetching unit data:', fetchError);
          setError('Gagal memuat data unit. Silakan coba lagi.');
          setLoading(false);
          return;
        }

        if (!unitData) {
          setError('Unit tidak ditemukan. Silakan hubungi administrator.');
          setLoading(false);
          return;
        }

        setData(unitData);
        setError(null);
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data unit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-primary mb-2">Error</h2>
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-primary mb-2">Unit Tidak Ditemukan</h2>
        <p className="text-text-secondary">
          Anda belum memiliki unit yang terdaftar. Silakan hubungi administrator.
        </p>
      </div>
    );
  }

  const { resident, unit, photos } = data;
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-primary mb-2">My Unit</h1>
          <p className="text-text-secondary">Informasi unit dan kontrak Anda</p>
        </div>

        {/* Unit Photo */}
        {primaryPhoto && (
          <div className="card overflow-hidden p-0">
            <img
              src={primaryPhoto.photo_url}
              alt={unit.unit_number}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Unit Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unit Details */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-primary font-semibold">Unit Details</h2>
                <p className="text-sm text-text-secondary">Informasi unit</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Unit Number</span>
                <span className="text-primary font-medium">{unit.unit_number}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Type</span>
                <span className="text-primary font-medium">{unit.unit_type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Floor</span>
                <span className="text-primary font-medium">Floor {unit.floor}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Size</span>
                <span className="text-primary font-medium">{unit.size_sqm} m²</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Bedrooms</span>
                <span className="text-primary font-medium">{unit.bedrooms}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Bathrooms</span>
                <span className="text-primary font-medium">{unit.bathrooms}</span>
              </div>
              {unit.orientation && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-text-secondary">Orientation</span>
                  <span className="text-primary font-medium capitalize">{unit.orientation}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  unit.status === 'occupied' ? 'bg-green-100 text-green-700' :
                  unit.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {unit.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-primary font-semibold">Contract Details</h2>
                <p className="text-sm text-text-secondary">Informasi kontrak</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Monthly Rent</span>
                <span className="text-primary font-semibold">{formatCurrency(unit.monthly_rent)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Deposit</span>
                <span className="text-primary font-medium">{formatCurrency(resident.deposit_amount || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Contract Start</span>
                <span className="text-primary font-medium">{formatDate(resident.contract_start)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-text-secondary">Contract End</span>
                <span className="text-primary font-medium">{formatDate(resident.contract_end)}</span>
              </div>
              {resident.move_in_date && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-text-secondary">Move-in Date</span>
                  <span className="text-primary font-medium">{formatDate(resident.move_in_date)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  resident.status === 'active' ? 'bg-green-100 text-green-700' :
                  resident.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  resident.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {resident.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        {(resident.emergency_contact_name || resident.emergency_contact_phone) && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-primary font-semibold">Emergency Contact</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resident.emergency_contact_name && (
                <div>
                  <span className="text-sm text-text-secondary">Name</span>
                  <p className="text-primary font-medium">{resident.emergency_contact_name}</p>
                </div>
              )}
              {resident.emergency_contact_phone && (
                <div>
                  <span className="text-sm text-text-secondary">Phone</span>
                  <p className="text-primary font-medium">{resident.emergency_contact_phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floor Plan */}
        {unit.floor_plan_url && (
          <div className="card p-6">
            <h2 className="text-primary font-semibold mb-4">Floor Plan</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <img
                src={unit.floor_plan_url}
                alt="Floor Plan"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Unit Photos Gallery */}
        {photos.length > 1 && (
          <div className="card p-6">
            <h2 className="text-primary font-semibold mb-4">Unit Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || unit.unit_number}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

