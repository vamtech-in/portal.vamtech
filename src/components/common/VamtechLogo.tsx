import React from 'react';

interface LogoProps {
  className?: string;
  showSubtext?: boolean;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

export default function VamtechLogo({ className = '', showSubtext = true, size = 'md', darkMode = false }: LogoProps) {
  const iconSizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-display select-none ${className}`}>
      {/* VM Tech Logo Icon matching vamtech.in SVG logo */}
      <div className="flex items-center gap-1">
        <svg
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSizes[size]} w-auto`}
        >
          {/* V Path */}
          <path
            d="M2 4L12 28L22 4"
            stroke={darkMode ? '#ffffff' : '#0f172a'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* M Path overlapping */}
          <path
            d="M18 4L28 28L38 4L46 28"
            stroke="#f9572a"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Name Textmark */}
      <div className="flex flex-col">
        <div className="flex items-center leading-none">
          <span className={`font-black ${textSizes[size]} tracking-tight ${darkMode ? 'text-white' : 'text-[#0f172a]'}`}>
            V<span className="text-[#f9572a]">M</span>Tech
          </span>
        </div>
        {showSubtext && (
          <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-0.5 font-bold">
            INTERNAL PORTAL
          </span>
        )}
      </div>
    </div>
  );
}
