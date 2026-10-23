import React from 'react';

interface LineArtHuggingProps {
  className?: string;
}

export const LineArtHugging: React.FC<LineArtHuggingProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center p-6 bg-white rounded-3xl border border-[#EED9C7] overflow-hidden ${className}`}>
      
      {/* Background soft ambient halo */}
      <div className="absolute inset-0 bg-radial from-[#FFF3E8] via-transparent to-transparent opacity-60" />

      {/* SVG Canvas for Elegant Black Line Art (Mother, Father & Baby embracing) */}
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[340px] h-auto select-none relative z-10 animate-gentle-pulse"
      >
        <g stroke="#1F2421" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          
          {/* Father's Contoured Head & Protective Shoulder Curve */}
          <path d="M 120 120 C 120 70, 160 50, 195 50 C 230 50, 245 75, 240 100" />
          <path d="M 240 100 C 275 110, 310 145, 315 210 C 320 280, 280 340, 240 360" />
          <path d="M 120 120 C 95 140, 75 180, 75 230 C 75 285, 110 345, 160 365" />

          {/* Mother's Tender Inclined Head & Forehead touch */}
          <path d="M 175 110 C 150 110, 135 130, 135 155 C 135 185, 155 210, 185 215" />
          <path d="M 155 135 C 175 145, 195 140, 210 125" />
          {/* Mother's hair flowing strand */}
          <path d="M 135 155 C 115 175, 110 220, 125 260" strokeWidth="2" strokeDasharray="3 1" />

          {/* Father's gentle forehead resting on mother */}
          <path d="M 195 50 C 185 75, 175 95, 165 115" />

          {/* Baby cradled between mother and father's arms */}
          {/* Baby's round head */}
          <circle cx="200" cy="225" r="30" stroke="#1F2421" strokeWidth="2.5" fill="#FFFFFF" />
          {/* Baby's closed peaceful sleeping eyelid */}
          <path d="M 190 225 Q 196 230 202 225" stroke="#1F2421" strokeWidth="2" fill="none" />
          {/* Baby's soft button nose and cheek */}
          <path d="M 205 227 Q 208 230 206 233" stroke="#1F2421" strokeWidth="1.8" />
          {/* Baby's sweet contented smile */}
          <path d="M 194 237 Q 200 242 206 237" stroke="#1F2421" strokeWidth="2" fill="none" />
          
          {/* Baby's tiny arm reaching up to parent's cheek */}
          <path d="M 215 245 C 228 235, 232 215, 222 195" strokeWidth="2" />
          <circle cx="222" cy="195" r="4" fill="#1F2421" />

          {/* Mother and Father's sheltering hands and arms forming a nest */}
          <path d="M 140 280 C 160 300, 220 305, 250 275" strokeWidth="3" />
          <path d="M 160 255 C 175 270, 210 270, 230 250" strokeWidth="2" />

          {/* Tender floral sprig or floating warmth symbol */}
          <path d="M 270 290 Q 285 300 275 315 Q 260 305 270 290" fill="#FF8552" fillOpacity="0.15" stroke="#FF8552" strokeWidth="1.5" />
          <path d="M 130 190 Q 120 180 130 170 Q 140 180 130 190" fill="#2F6B47" fillOpacity="0.15" stroke="#2F6B47" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Caption badge */}
      <div className="absolute bottom-3 text-center w-full px-4">
        <span className="text-[11px] font-semibold text-[#8C6D53] tracking-wide">
          মা, বাবা ও সন্তানের অবিচ্ছেদ্য ভালোবাসার বন্ধন
        </span>
      </div>

    </div>
  );
};
