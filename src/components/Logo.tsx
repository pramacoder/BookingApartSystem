import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dark' | 'footer';
  showText?: boolean;
  subtitle?: string;
  to?: string;
  className?: string;
}

export function Logo({
  size = 'md',
  variant = 'default',
  showText = true,
  subtitle = 'Apartment',
  to = '/',
  className = '',
}: LogoProps) {
  // Strict pixel constraints so logo can NEVER overflow or spill out
  const pixelSizes = {
    sm: 32,
    md: 42,
    lg: 52,
    xl: 64,
  };

  const currentPixelSize = pixelSizes[size] || 42;

  const titleSizeClasses = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  };

  const isFooter = variant === 'footer';

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Logo Graphic Container - Strict width and height */}
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden shadow-sm shrink-0 transition-transform hover:scale-105 duration-200 ${
          isFooter ? 'bg-white p-1 ring-2 ring-white/20' : 'bg-white border border-gray-100 p-0.5'
        }`}
        style={{
          width: `${currentPixelSize}px`,
          height: `${currentPixelSize}px`,
          minWidth: `${currentPixelSize}px`,
          minHeight: `${currentPixelSize}px`,
          maxWidth: `${currentPixelSize}px`,
          maxHeight: `${currentPixelSize}px`,
        }}
      >
        <img
          src="/logo.png"
          alt="GreenView Logo"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
          loading="eager"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`${titleSizeClasses[size]} tracking-tight ${
              isFooter ? 'text-white' : 'text-primary'
            }`}
          >
            GreenView
          </span>
          {subtitle && (
            <span
              className={`text-xs ${
                isFooter ? 'text-tertiary' : 'text-text-secondary'
              } font-medium tracking-wide`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="group cursor-pointer inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
