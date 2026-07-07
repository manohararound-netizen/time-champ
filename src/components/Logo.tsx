import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-11", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="around29-logo-wrapper">
      {/* Brand Icon Matching the uploaded image */}
      <div className="relative flex-shrink-0" style={{ width: '46px', height: '39px' }}>
        <svg viewBox="0 0 100 85" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Orange speech bubble background */}
          <path 
            d="M 15 0 C 6.7 0 0 6.7 0 15 L 0 55 C 0 63.3 6.7 70 15 70 L 15 82 C 15 84.5 18 85.5 19.5 83.5 L 34 70 L 85 70 C 93.3 70 100 63.3 100 55 L 100 15 C 100 6.7 93.3 0 85 0 Z" 
            fill="#ff981a" 
          />
          
          {/* White Outer Circle outline with clockwise arrow structure */}
          <circle 
            cx="50" 
            cy="41" 
            r="23" 
            stroke="#ffffff" 
            strokeWidth="4.5" 
            fill="none" 
          />
          
          {/* Green active tracking segment (vibrant green, matching the image) */}
          <path 
            d="M 69.5 28.5 A 23 23 0 0 1 73 41" 
            fill="none" 
            stroke="#72bf24" 
            strokeWidth="7" 
            strokeLinecap="round" 
          />
          
          {/* Arrow Head (at the end of the circular path) */}
          <path 
            d="M 64.5 18 L 73.5 26.5 L 61.5 32 Z" 
            fill="#ffffff" 
          />
          
          {/* White Centered Checkmark */}
          <path 
            d="M 36.5 41 L 45.5 50 L 61.5 31.5" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>

      {/* Brand Text - Stacked layout separated by vertical line */}
      {showText && (
        <div className="flex items-center h-full">
          {/* Vertical divider matching the image */}
          <div className="h-9 w-[1.5px] bg-slate-200 dark:bg-slate-700 mx-1.5" />
          
          {/* Around29 Champ stacked text */}
          <div className="flex flex-col justify-center leading-none pl-1.5">
            <span 
              className="text-[17px] font-black text-white tracking-tight" 
              style={{ 
                fontFamily: '"Space Grotesk", "Inter", sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Around29
            </span>
            <span 
              className="text-[17px] font-black text-[#ff981a] tracking-tight mt-[3px]" 
              style={{ 
                fontFamily: '"Space Grotesk", "Inter", sans-serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.15)'
              }}
            >
              Champ
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

