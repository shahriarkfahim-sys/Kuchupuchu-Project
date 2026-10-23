import React from 'react';

interface MotherBabyCartoonProps {
  className?: string;
}

export const MotherBabyCartoon: React.FC<MotherBabyCartoonProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-4 bg-transparent overflow-hidden ${className}`}>
      
      {/* Cartoon Animation Styles */}
      <style>{`
        @keyframes gentleMotherHand {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-7deg) translate(-2px, -3px);
          }
        }
        @keyframes gentleBabyHand {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(-4deg);
          }
        }
        @keyframes gentleFloatingStar {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.08);
          }
        }
        .mother-hand-animated {
          transform-origin: 175px 195px;
          animation: gentleMotherHand 2.4s ease-in-out infinite;
        }
        .baby-hand-animated {
          transform-origin: 275px 240px;
          animation: gentleBabyHand 2.0s ease-in-out infinite;
        }
        .star-animated {
          transform-origin: 250px 260px;
          animation: gentleFloatingStar 2.0s ease-in-out infinite;
        }
      `}</style>

      {/* SVG Cartoon Artwork: Mother & Baby Playing with Stacking Cups */}
      <svg
        viewBox="0 0 460 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[420px] h-auto select-none relative z-10 transition-transform duration-300"
      >
        <defs>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8C6D53" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Floor Play Rug / Shadow */}
        <ellipse cx="230" cy="350" rx="195" ry="20" fill="#FAF0E6" />
        <ellipse cx="230" cy="350" rx="145" ry="13" fill="#F3E5D8" />

        {/* --- MOTHER (Left/Center background) --- */}
        <g id="mother" filter="url(#softShadow)">
          {/* Mother's hair back */}
          <path d="M 120 120 C 105 160, 110 230, 135 250 C 145 230, 150 160, 140 120 Z" fill="#3D2817" />

          {/* Mother's body / Coral Blouse */}
          <path d="M 140 170 C 120 185, 110 220, 115 280 C 135 285, 175 285, 200 280 C 205 230, 195 185, 175 170 Z" fill="#FF8552" />

          {/* Mother's Teal Trousers / Crossed Legs */}
          <path d="M 115 280 C 95 300, 85 335, 120 355 C 160 365, 230 365, 260 350 C 270 330, 240 300, 200 280 Z" fill="#2F6B47" opacity="0.88" />
          {/* Slipper / Foot */}
          <path d="M 85 340 C 75 350, 95 365, 115 360 Z" fill="#F5CBA7" />

          {/* Mother's Head & Face (Warm Light Asian / South Asian Skin Tone #F5CBA7) */}
          <circle cx="160" cy="130" r="34" fill="#F5CBA7" />

          {/* Mother's Left Eye (Smiling Curve with Lashes) */}
          <path d="M 146 129 Q 152 134 157 129" stroke="#2B1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 148 127 L 145 125" stroke="#2B1810" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mother's Left Eyebrow */}
          <path d="M 144 122 Q 151 119 157 122" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Mother's Right Eye (Smiling Curve with Lashes - explicitly added per feedback) */}
          <path d="M 163 129 Q 169 134 175 129" stroke="#2B1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 174 127 L 177 125" stroke="#2B1810" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mother's Right Eyebrow */}
          <path d="M 162 122 Q 169 119 176 122" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Mother's Rosy Cheeks */}
          <ellipse cx="145" cy="138" rx="5" ry="3.5" fill="#FF8A80" opacity="0.45" />
          <ellipse cx="175" cy="138" rx="5" ry="3.5" fill="#FF8A80" opacity="0.45" />

          {/* Mother's Warm Smile */}
          <path d="M 155 144 Q 161 151 167 144" stroke="#2B1810" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          
          {/* Mother's Hair Front / Bun / Styled bangs */}
          <path d="M 130 120 C 135 90, 185 85, 195 115 C 175 110, 145 110, 130 120 Z" fill="#3D2817" />
          {/* Hair Bun at Top */}
          <circle cx="178" cy="88" r="16" fill="#3D2817" />
          <circle cx="178" cy="88" r="13" fill="#2E1D11" />
          <path d="M 172 82 Q 178 78 184 82" stroke="#FF8552" strokeWidth="2.5" fill="none" />

          {/* Mother's Animated Arm & Hand reaching forward encouraging baby */}
          <g className="mother-hand-animated">
            <path d="M 175 195 C 190 208, 218 216, 238 212 C 243 222, 228 232, 208 232 C 188 232, 172 216, 166 202 Z" fill="#F5CBA7" />
            {/* Clapping / Cheering open palm */}
            <circle cx="239" cy="214" r="6" fill="#F5CBA7" />
            <path d="M 239 209 Q 244 212 245 217" stroke="#2B1810" strokeWidth="1" strokeLinecap="round" fill="none" />
          </g>
        </g>

        {/* --- BABY (Sitting right, stacking cups) --- */}
        <g id="baby" filter="url(#softShadow)">
          {/* Baby's Soft Romper */}
          <path d="M 285 240 C 270 255, 265 295, 275 330 C 295 340, 335 340, 350 330 C 355 295, 345 255, 330 240 Z" fill="#60A5FA" />
          {/* Yellow Collar Accent */}
          <path d="M 295 240 Q 308 248 320 240" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Baby's Chubby Legs & Bare Feet (Warm Asian Skin Tone #F8D7BE) */}
          <path d="M 275 320 C 260 335, 255 355, 280 358 C 300 358, 295 335, 285 320 Z" fill="#F8D7BE" />
          <path d="M 345 320 C 360 335, 365 355, 340 358 C 320 358, 325 335, 335 320 Z" fill="#F8D7BE" />
          {/* Baby's Cute Toes */}
          <circle cx="264" cy="350" r="3.5" fill="#F8D7BE" />
          <circle cx="356" cy="350" r="3.5" fill="#F8D7BE" />

          {/* Baby's Big Round Head */}
          <circle cx="308" cy="190" r="30" fill="#F8D7BE" />
          
          {/* Baby's Soft Brown Curly Hair Tuft */}
          <path d="M 302 163 Q 308 153 315 163 Q 320 156 325 164" stroke="#4A2810" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Baby's Joyful Sparkly Eyes */}
          <circle cx="298" cy="188" r="3" fill="#1E293B" />
          <circle cx="316" cy="188" r="3" fill="#1E293B" />
          <circle cx="297" cy="187" r="1.1" fill="#FFFFFF" />
          <circle cx="315" cy="187" r="1.1" fill="#FFFFFF" />

          {/* Baby's Rosy Cheeks */}
          <ellipse cx="292" cy="196" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="322" cy="196" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.6" />

          {/* Baby's Sweet Big Laughing Open Mouth */}
          <path d="M 302 198 Q 307 207 313 198 Z" fill="#E11D48" />

          {/* Baby's Chubby Animated Left Arm Reaching up to place the top cup */}
          <g className="baby-hand-animated">
            <path d="M 285 245 C 270 230, 260 210, 252 205 C 248 210, 255 225, 270 240 Z" fill="#F8D7BE" />
            <circle cx="250" cy="204" r="5.5" fill="#F8D7BE" />
          </g>
        </g>

        {/* --- COLORFUL STACKING CUPS (Fine Motor & Cognitive Play in the middle) --- */}
        <g id="stacking-cups" filter="url(#softShadow)">
          {/* Base Big Cup: Teal */}
          <path d="M 230 345 L 234 322 L 266 322 L 270 345 Z" fill="#0D9488" rx="2" />
          <line x1="234" y1="322" x2="266" y2="322" stroke="#115E59" strokeWidth="1.5" />

          {/* 2nd Cup: Warm Orange / Coral */}
          <path d="M 235 322 L 238 302 L 262 302 L 265 322 Z" fill="#F97316" rx="2" />
          <line x1="238" y1="302" x2="262" y2="302" stroke="#C2410C" strokeWidth="1.5" />

          {/* 3rd Cup: Fresh Lime / Green */}
          <path d="M 240 302 L 243 284 L 257 284 L 260 302 Z" fill="#84CC16" rx="2" />
          <line x1="243" y1="284" x2="257" y2="284" stroke="#4D7C0F" strokeWidth="1.5" />

          {/* Top 4th Cup: Bright Sunny Yellow (about to be placed) */}
          <g className="star-animated">
            <path d="M 244 284 L 246 268 L 254 268 L 256 284 Z" fill="#FACC15" rx="2" />
            {/* Tiny Star on top cup */}
            <path d="M 250 258 L 252 263 L 257 263 L 253 266 L 255 271 L 250 268 L 245 271 L 247 266 L 243 263 L 248 263 Z" fill="#F59E0B" />
          </g>
        </g>

        {/* Floating Playful Accents (Hearts, Stars) */}
        <g id="play-accents">
          {/* Warm Heart floating above */}
          <path d="M 205 105 C 205 98, 215 95, 218 102 C 221 95, 231 98, 231 105 C 231 114, 218 120, 218 120 C 218 120, 205 114, 205 105 Z" fill="#FF8552" fillOpacity="0.85" />
          {/* Sparkles */}
          <path d="M 330 135 Q 333 130 336 135 Q 341 138 336 141 Q 333 146 330 141 Q 325 138 330 135 Z" fill="#FBBF24" />
          <circle cx="280" cy="140" r="3" fill="#60A5FA" opacity="0.6" />
          <circle cx="110" cy="210" r="4" fill="#34D399" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
};
