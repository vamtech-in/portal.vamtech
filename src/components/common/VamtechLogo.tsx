import React from 'react';

interface LogoProps {
  className?: string;
  showSubtext?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VamtechLogo({ className = '', showSubtext = true, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 font-display ${className}`}>
      {/* VAMTech Brand Shield/V Symbol SVG */}
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-[#07111e] via-[#0b1f3a] to-[#1b3861] border border-vamgold-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(229,169,60,0.2)] shrink-0 relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-vamgold-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-vamgold-400 drop-shadow-[0_0_6px_rgba(242,189,87,0.5)]"
        >
          {/* Stylized V Tech Geometry */}
          <path
            d="M4 4L12 20L20 4M8 4L12 12L16 4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="1.5" fill="#38bdf8" />
        </svg>
      </div>

      {/* Brand Textmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black ${textSizes[size]} tracking-tight text-white`}>
            VAM<span className="bg-gradient-to-r from-vamgold-400 to-amber-300 bg-clip-text text-transparent">Tech</span>
          </span>
        </div>
        {showSubtext && (
          <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 uppercase">
            INTERNAL PORTAL
          </span>
        )}
      </div>
    </div>
  );
}
