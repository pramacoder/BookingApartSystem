import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, ArrowRight } from 'lucide-react';
import { Unit, formatCurrency } from '../data/mockData';

interface UnitCardProps {
  unit: Unit;
  view?: 'grid' | 'list';
}

export function UnitCard({ unit, view = 'grid' }: UnitCardProps) {
  const statusColor = {
    available: 'bg-success text-white',
    occupied: 'bg-error text-white',
    maintenance: 'bg-warning text-white'
  };

  const statusLabel = {
    available: 'Tersedia',
    occupied: 'Tersewa',
    maintenance: 'Maintenance'
  };

  if (view === 'list') {
    return (
      <div className="card card-hover flex flex-col md:flex-row">
        <div className="md:w-1/3 h-64 md:h-auto relative overflow-hidden">
          <img
            src={unit.images[0]}
            alt={unit.unitNumber}
            className="w-full h-full object-cover"
          />
          <div className={`absolute top-4 left-4 badge ${statusColor[unit.status]}`}>
            {statusLabel[unit.status]}
          </div>
        </div>
        <div className="md:w-2/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-primary mb-1">Unit {unit.unitNumber}</h3>
                <p className="text-sm text-text-secondary">{unit.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Mulai dari</p>
                <p className="text-accent">{formatCurrency(unit.monthlyRent)}/bulan</p>
              </div>
            </div>
            
            <p className="text-text-secondary text-sm mb-4">{unit.description}</p>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Maximize className="w-4 h-4" />
                <span className="text-sm">{unit.size}m²</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Bed className="w-4 h-4" />
                <span className="text-sm">{unit.bedrooms} Bedroom</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Bath className="w-4 h-4" />
                <span className="text-sm">{unit.bathrooms} Bathroom</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Lantai {unit.floor}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {unit.features.slice(0, 4).map((feature, index) => (
                <span key={index} className="px-3 py-1 bg-tertiary/20 text-secondary rounded-full text-xs">
                  {feature}
                </span>
              ))}
              {unit.features.length > 4 && (
                <span className="px-3 py-1 bg-tertiary/20 text-secondary rounded-full text-xs">
                  +{unit.features.length - 4} more
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Link
              to={`/unit/${unit.id}`}
              className="btn-primary inline-flex items-center gap-2 w-full md:w-auto justify-center"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover">
      <div className="relative h-56 overflow-hidden">
        <img
          src={unit.images[0]}
          alt={unit.unitNumber}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className={`absolute top-4 right-4 badge ${statusColor[unit.status]}`}>
          {statusLabel[unit.status]}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-primary mb-1">Unit {unit.unitNumber}</h3>
            <p className="text-sm text-text-secondary">{unit.type}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Maximize className="w-4 h-4" />
            <span className="text-sm">{unit.size}m²</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{unit.bedrooms} BR</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{unit.bathrooms} BA</span>
          </div>
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">Mulai dari</p>
            <p className="text-accent">{formatCurrency(unit.monthlyRent)}/bln</p>
          </div>
          <Link
            to={`/unit/${unit.id}`}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <span className="text-sm">Detail</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
