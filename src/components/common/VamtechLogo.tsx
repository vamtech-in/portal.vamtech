import React from 'react';

interface LogoProps {
  className?: string;
  showSubtext?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VamtechLogo({ className = '', showSubtext = true, size = 'md' }: LogoProps) {
  const imageHeights = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12',
  };

  return (
    <div className={`flex items-center gap-3 font-display select-none ${className}`}>
      {/* Official VAMTech Logo Image */}
      <img
        src="https://www.vamtech.in/images/vamtech-logo.png"
        alt="VAMTech Pvt Ltd"
        className={`${imageHeights[size]} w-auto object-contain shrink-0`}
        onError={(e) => {
          // Fallback to local image copy if offline
          (e.target as HTMLImageElement).src = '/images/vamtech-logo.png';
        }}
      />
      {showSubtext && (
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold border-l-2 border-slate-200 pl-2.5 py-0.5">
          PORTAL
        </span>
      )}
    </div>
  );
}
