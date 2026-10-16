import React from 'react';

export const SchoolIllustration: React.FC<{ className?: string }> = ({ className = 'w-72 h-44' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 340 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Soft clouds in background */}
        <path
          d="M40 50C40 43.37 45.37 38 52 38C53.86 38 55.62 38.42 57.19 39.18C59.6 34.92 64.19 32 69.5 32C77.5 32 84 38.5 84 46.5C84 47.38 83.92 48.24 83.77 49.07C86.78 49.88 89 52.68 89 56C89 59.86 85.86 63 82 63H48C43.58 63 40 59.42 40 55V50Z"
          fill="#DBEAFE"
          opacity="0.6"
        />
        <path
          d="M260 40C260 34.48 264.48 30 270 30C271.6 30 273.1 30.38 274.45 31.05C276.5 27.42 280.4 25 285 25C291.63 25 297 30.37 297 37C297 37.75 296.93 38.48 296.8 39.19C299.27 39.92 301 42.23 301 45C301 48.31 298.31 51 295 51H267C263.13 51 260 47.87 260 44V40Z"
          fill="#DBEAFE"
          opacity="0.6"
        />

        {/* Tree Behind Left */}
        <circle cx="65" cy="135" r="24" fill="#34D399" />
        <circle cx="50" cy="145" r="18" fill="#10B981" />
        <rect x="62" y="145" width="6" height="28" rx="2" fill="#78350F" />

        {/* Tree Behind Right */}
        <circle cx="275" cy="135" r="24" fill="#34D399" />
        <circle cx="290" cy="145" r="18" fill="#10B981" />
        <rect x="272" y="145" width="6" height="28" rx="2" fill="#78350F" />

        {/* Building Base Shadows */}
        <rect x="76" y="165" width="188" height="6" rx="2" fill="#CBD5E1" opacity="0.6" />

        {/* Left Wing Facade */}
        <rect x="80" y="105" width="65" height="62" rx="2" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1.5" />
        {/* Left Wing Roof */}
        <polygon points="76,105 149,105 145,86 80,86" fill="#3B82F6" />
        <polygon points="80,86 145,86 142,82 83,82" fill="#2563EB" />

        {/* Right Wing Facade */}
        <rect x="195" y="105" width="65" height="62" rx="2" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1.5" />
        {/* Right Wing Roof */}
        <polygon points="191,105 264,105 260,86 195,86" fill="#3B82F6" />
        <polygon points="195,86 260,86 257,82 198,82" fill="#2563EB" />

        {/* Center Main Tower Facade */}
        <rect x="135" y="78" width="70" height="90" rx="3" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
        {/* Center Triangular Roof */}
        <polygon points="127,79 170,42 213,79" fill="#1D4ED8" />
        <polygon points="132,79 170,46 208,79" fill="#2563EB" />

        {/* Center Small Spire */}
        <rect x="168" y="32" width="4" height="11" fill="#1E40AF" rx="1" />
        <circle cx="170" cy="32" r="3" fill="#F59E0B" />

        {/* Clock in center gable */}
        <circle cx="170" cy="62" r="11" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="2" />
        <circle cx="170" cy="62" r="1.5" fill="#1E293B" />
        <line x1="170" y1="62" x2="167" y2="56" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="170" y1="62" x2="175" y2="60" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

        {/* Left Wing Windows */}
        <rect x="92" y="115" width="18" height="20" rx="2" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="101" y1="115" x2="101" y2="135" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="92" y1="125" x2="110" y2="125" stroke="#2563EB" strokeWidth="1.5" />

        <rect x="118" y="115" width="18" height="20" rx="2" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="127" y1="115" x2="127" y2="135" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="118" y1="125" x2="136" y2="125" stroke="#2563EB" strokeWidth="1.5" />

        {/* Right Wing Windows */}
        <rect x="204" y="115" width="18" height="20" rx="2" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="213" y1="115" x2="213" y2="135" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="204" y1="125" x2="222" y2="125" stroke="#2563EB" strokeWidth="1.5" />

        <rect x="230" y="115" width="18" height="20" rx="2" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="239" y1="115" x2="239" y2="135" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="230" y1="125" x2="248" y2="125" stroke="#2563EB" strokeWidth="1.5" />

        {/* Center Tower Second Story Windows */}
        <rect x="150" y="90" width="16" height="18" rx="2" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="1.5" />
        <line x1="158" y1="90" x2="158" y2="108" stroke="#1D4ED8" strokeWidth="1.5" />
        <line x1="150" y1="99" x2="166" y2="99" stroke="#1D4ED8" strokeWidth="1.5" />
        <rect x="174" y="90" width="16" height="18" rx="2" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="1.5" />
        <line x1="182" y1="90" x2="182" y2="108" stroke="#1D4ED8" strokeWidth="1.5" />
        <line x1="174" y1="99" x2="190" y2="99" stroke="#1D4ED8" strokeWidth="1.5" />

        {/* Main Double Entrance Door */}
        <rect x="158" y="128" width="24" height="38" rx="2" fill="#1D4ED8" />
        <line x1="170" y1="128" x2="170" y2="166" stroke="#93C5FD" strokeWidth="1.5" />
        <rect x="161" y="132" width="7" height="14" rx="1" fill="#60A5FA" />
        <rect x="172" y="132" width="7" height="14" rx="1" fill="#60A5FA" />
        <circle cx="168" cy="150" r="1.2" fill="#FDE047" />
        <circle cx="172" cy="150" r="1.2" fill="#FDE047" />

        {/* Entrance Steps */}
        <rect x="152" y="166" width="36" height="3" fill="#E2E8F0" rx="1" />
        <rect x="148" y="169" width="44" height="3" fill="#CBD5E1" rx="1" />

        {/* Foreground Grass Mound */}
        <path
          d="M30 178C60 166 120 167 170 167C220 167 280 166 310 178C320 182 325 186 325 190H15C15 186 20 182 30 178Z"
          fill="#22C55E"
        />
        <circle cx="70" cy="168" r="14" fill="#16A34A" />
        <circle cx="58" cy="172" r="11" fill="#15803D" />
        <circle cx="270" cy="168" r="14" fill="#16A34A" />
        <circle cx="282" cy="172" r="11" fill="#15803D" />
        <polygon points="163,172 177,172 184,188 156,188" fill="#FDE68A" opacity="0.8" />
      </svg>
    </div>
  );
};
