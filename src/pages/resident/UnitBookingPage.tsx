import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, DollarSign, Home, CheckCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUnitWithPhotos, getResidentId, createResident } from '../../lib/database';
import { createUnitBooking } from '../../lib/database';
import type { Unit, UnitPhoto, BookingDurationType } from '../../lib/types/database';
import { formatCurrency } from '../../data/mockData';

export function UnitBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const unitId = searchParams.get('unit_id');

  const [unit, setUnit] = useState<Unit | null>(null);
  const [photos, setPhotos] = useState<UnitPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<BookingDurationType>('monthly');
  const [creatingBooking, setCreatingBooking] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { message: 'Silakan login terlebih dahulu untuk melakukan booking unit.' } });
      return;
    }

    if (!unitId) {
      setError('Unit ID tidak ditemukan. Silakan pilih unit terlebih dahulu.');
      setLoading(false);
      return;
    }

    loadUnitData();
  }, [unitId, user, navigate]);

  const loadUnitData = async () => {
    if (!unitId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getUnitWithPhotos(unitId);
      if (fetchError) throw fetchError;

      if (!data) {
        setError('Unit tidak ditemukan.');
        setLoading(false);
        return;
      }

      setUnit(data.unit);
      setPhotos(data.photos || []);

      // Check if unit is available
      if (data.unit.status !== 'available') {
        setError('Unit ini tidak tersedia untuk booking saat ini.');
      }
    } catch (err: any) {
      console.error('Error loading unit data:', err);
      setError('Gagal memuat data unit. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!unit) return { rent: 0, deposit: 0, adminFee: 2500, total: 0 };

    let rent = 0;
    const deposit = unit.deposit_required || 0;
    const adminFee = 2500; // Fixed admin fee

    switch (selectedDuration) {
      case 'weekly':
        // Calculate weekly rent from monthly (monthly / 4)
        rent = unit.weekly_rent || unit.monthly_rent / 4;
        break;
      case 'monthly':
        rent = unit.monthly_rent;
        break;
      case 'yearly':
        // Use yearly_rent if available, otherwise calculate from monthly (monthly * 12)
        rent = unit.yearly_rent || unit.monthly_rent * 12;
        break;
    }

    const total = rent + deposit + adminFee;

    return { rent, deposit, adminFee, total };
  };

  const calculateEndDate = (startDate: Date, duration: BookingDurationType): Date => {
    const endDate = new Date(startDate);
    
    switch (duration) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    return endDate;
  };

  const handleCreateBooking = async () => {
    if (!unit || !user) return;

    setCreatingBooking(true);
    setError(null);

    try {
      // Get or create resident ID
      let residentId = await getResidentId(user.id);
      
      if (!residentId) {
        // Create resident record if it doesn't exist
        const { data: newResident, error: residentError } = await createResident({
          user_id: user.id,
          status: 'pending',
        });

        if (residentError || !newResident) {
          throw new Error('Gagal membuat record resident. Silakan coba lagi.');
        }

        residentId = newResident.id;
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = calculateEndDate(startDate, selectedDuration);
      const prices = calculatePrice();

      // Create unit booking
      const { data: booking, error: bookingError } = await createUnitBooking({
        resident_id: residentId,
        unit_id: unit.id,
        booking_duration_type: selectedDuration,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        rent_amount: prices.rent,
        deposit_amount: prices.deposit,
        admin_fee: prices.adminFee,
        total_amount: prices.total,
        payment_status: 'pending',
        status: 'pending',
      });

      if (bookingError || !booking) {
        throw bookingError || new Error('Gagal membuat booking. Silakan coba lagi.');
      }

      // Redirect to payment page with booking ID
      navigate(`/resident/payment/unit-booking/${booking.id}`);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Gagal membuat booking. Silakan coba lagi.');
    } finally {
      setCreatingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data unit...</p>
        </div>
      </div>
    );
  }

  if (error && !unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-primary mb-2">Error</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button onClick={() => navigate('/catalogue')} className="btn-primary">
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  if (!unit) return null;

  const prices = calculatePrice();
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/catalogue')}
            className="text-text-secondary hover:text-primary transition-colors mb-4 inline-flex items-center gap-2"
          >
            ← Kembali ke Katalog
          </button>
          <h1 className="text-3xl font-bold text-primary">Booking Unit</h1>
          <p className="text-text-secondary mt-2">Pilih durasi booking dan lanjutkan ke pembayaran</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Unit Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start gap-4 mb-6">
                {primaryPhoto && (
                  <img
                    src={primaryPhoto.photo_url}
                    alt={unit.unit_number}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-1">Unit {unit.unit_number}</h2>
                  <p className="text-text-secondary mb-2">
                    {unit.unit_type} • {unit.floor} lantai • {unit.size_sqm} m²
                  </p>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{unit.bedrooms} Kamar Tidur</span>
                    <span>{unit.bathrooms} Kamar Mandi</span>
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary mb-4">Pilih Durasi Booking</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['weekly', 'monthly', 'yearly'] as BookingDurationType[]).map((duration) => {
                    const isSelected = selectedDuration === duration;
                    const durationLabels = {
                      weekly: 'Mingguan',
                      monthly: 'Bulanan',
                      yearly: 'Tahunan',
                    };

                    let durationPrice = 0;
                    if (unit) {
                      switch (duration) {
                        case 'weekly':
                          durationPrice = unit.weekly_rent || unit.monthly_rent / 4;
                          break;
                        case 'monthly':
                          durationPrice = unit.monthly_rent;
                          break;
                        case 'yearly':
                          durationPrice = unit.yearly_rent || unit.monthly_rent * 12;
                          break;
                      }
                    }

                    return (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setSelectedDuration(duration)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                            {durationLabels[duration]}
                          </span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {formatCurrency(durationPrice)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features */}
              {unit.features && unit.features.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-primary mb-3">Fasilitas Unit</h3>
                  <div className="flex flex-wrap gap-2">
                    {unit.features.map((feature: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-primary mb-6">Ringkasan Booking</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Sewa ({selectedDuration === 'weekly' ? 'Mingguan' : selectedDuration === 'monthly' ? 'Bulanan' : 'Tahunan'})</span>
                  <span className="text-text-primary font-medium">{formatCurrency(prices.rent)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Deposit</span>
                  <span className="text-text-primary font-medium">{formatCurrency(prices.deposit)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Biaya Admin</span>
                  <span className="text-text-primary font-medium">{formatCurrency(prices.adminFee)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-primary">Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(prices.total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateBooking}
                disabled={creatingBooking || unit.status !== 'available'}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {creatingBooking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjutkan ke Pembayaran
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {unit.status !== 'available' && (
                <p className="text-sm text-error mt-4 text-center">
                  Unit ini tidak tersedia untuk booking saat ini.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

