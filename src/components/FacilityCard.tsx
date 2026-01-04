import { Clock, Users, ArrowRight, Wrench } from 'lucide-react';
import { Facility, formatCurrency } from '../data/mockData';
import { Link } from 'react-router-dom';

interface FacilityCardProps {
  facility: Facility;
  onBook?: () => void;
}

export function FacilityCard({ facility, onBook }: FacilityCardProps) {
  const categoryIcons = {
    Sports: '🏃',
    Leisure: '🎉',
    Services: '🛠️',
    Commons: '🏢'
  };

  const statusColor = {
    available: 'bg-success/10 text-success',
    maintenance: 'bg-warning/10 text-warning',
    booked: 'bg-error/10 text-error'
  };

  const statusLabel = {
    available: 'Tersedia',
    maintenance: 'Maintenance',
    booked: 'Terbooked'
  };

  return (
    <div className="card card-hover">
      <div className="relative h-48 overflow-hidden">
        <img
          src={facility.image}
          alt={facility.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className={`absolute top-4 right-4 badge ${statusColor[facility.status]}`}>
          {statusLabel[facility.status]}
        </div>
        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
          {categoryIcons[facility.category]}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-primary mb-1">{facility.name}</h3>
          <p className="text-sm text-accent">{facility.category}</p>
        </div>

        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {facility.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Clock className="w-4 h-4 text-secondary" />
            <span>{facility.operationalHours}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Users className="w-4 h-4 text-secondary" />
            <span>Kapasitas: {facility.capacity} orang</span>
          </div>
          {facility.bookingFee > 0 && (
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span className="text-secondary">💰</span>
              <span>{formatCurrency(facility.bookingFee)} / booking</span>
            </div>
          )}
        </div>

        {facility.status === 'available' ? (
          onBook ? (
            <button
              onClick={onBook}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Book Now
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to={`/resident/bookings/new?facility=${facility.id}`}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Book Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          )
        ) : (
          <button
            disabled
            className="w-full px-6 py-3 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Not Available
          </button>
        )}
      </div>
    </div>
  );
}
