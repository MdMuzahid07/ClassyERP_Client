import React from 'react';

interface ClassyLogoProps {
  className?: string;
  iconOnly?: boolean;
  lightText?: boolean;
}

export const ClassyLogo: React.FC<ClassyLogoProps> = ({
  className = 'h-8',
  iconOnly = false,
  lightText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Scalable Vector Emblem with Growth Arrow Graph */}
      <svg
        viewBox="0 0 100 100"
        className="h-full w-auto flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-grad-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#001D6C" />
            <stop offset="60%" stopColor="#0F62FE" />
            <stop offset="100%" stopColor="#00D8F6" />
          </linearGradient>
        </defs>
        {/* Emblem Circular Outline */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#logo-grad-gradient)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeDasharray="170 50"
          transform="rotate(-40 50 50)"
        />
        {/* Growth line graph */}
        <path
          d="M26 62 L42 46 L58 56 L74 30"
          stroke="url(#logo-grad-gradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrowhead */}
        <path
          d="M62 30 H74 V42"
          stroke="url(#logo-grad-gradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Styled Responsive Brand Text */}
      {!iconOnly && (
        <span
          className={`font-bold tracking-tight text-lg select-none ${
            lightText ? 'text-white' : 'text-slate-800'
          }`}
        >
          Classy
          <span className="text-blue-600 font-black">ERP</span>
        </span>
      )}
    </div>
  );
};
export default ClassyLogo;
