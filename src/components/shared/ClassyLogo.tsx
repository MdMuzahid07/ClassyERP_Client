import React from 'react';
import { useTheme } from '../theme/theme-provider';

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
  const { theme } = useTheme();

  const isDarkBackground = lightText || theme === 'dark';

  if (iconOnly) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 220 220"
        className={className}
        fill="none"
      >
        <defs>
          <linearGradient id="classyGradIcon" x1="10%" y1="90%" x2="90%" y2="10%">
            <stop offset="0%" stopColor={isDarkBackground ? '#3b82f6' : '#0f62fe'} />
            <stop offset="60%" stopColor={isDarkBackground ? '#60a5fa' : '#3b82f6'} />
            <stop offset="100%" stopColor={isDarkBackground ? '#93c5fd' : '#1d4ed8'} />
          </linearGradient>
        </defs>

        <g fill="url(#classyGradIcon)">
          {/* Outer Ring with precise cuts */}
          <path d="M110,10 A100,100 0 1,0 205,140 L180,132 A75,75 0 1,1 110,35 Z" />

          {/* Inner Ring */}
          <path d="M110,50 A60,60 0 0,0 60,145 L78,130 A40,40 0 0,1 110,70 Z" />

          {/* Central Zig-Zag Growth Arrow & Horizontal Bars */}
          <path d="M 15,195 L 90,110 L 125,145 L 180,65 L 165,55 L 210,25 L 195,85 L 180,75 L 125,165 L 90,135 L 35,200 Z" />

          {/* Inner Triangle Fill */}
          <polygon points="90,165 105,145 120,165" />

          {/* Right side horizontal bars matching the "E" shape */}
          <rect x="135" y="95" width="60" height="22" rx="2" />
          <rect x="120" y="125" width="75" height="22" rx="2" />
        </g>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 220" className={className} fill="none">
      <defs>
        <linearGradient id="classyGradFull" x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor={isDarkBackground ? '#3b82f6' : '#0f62fe'} />
          <stop offset="60%" stopColor={isDarkBackground ? '#60a5fa' : '#3b82f6'} />
          <stop offset="100%" stopColor={isDarkBackground ? '#93c5fd' : '#1d4ed8'} />
        </linearGradient>
      </defs>

      {/* Logo Mark slightly scaled to align with text */}
      <g transform="translate(10, 10) scale(0.95)" fill="url(#classyGradFull)">
        <path d="M110,10 A100,100 0 1,0 205,140 L180,132 A75,75 0 1,1 110,35 Z" />
        <path d="M110,50 A60,60 0 0,0 60,145 L78,130 A40,40 0 0,1 110,70 Z" />
        <path d="M 15,195 L 90,110 L 125,145 L 180,65 L 165,55 L 210,25 L 195,85 L 180,75 L 125,165 L 90,135 L 35,200 Z" />
        <polygon points="90,165 105,145 120,165" />
        <rect x="135" y="95" width="60" height="22" rx="2" />
        <rect x="120" y="125" width="75" height="22" rx="2" />
      </g>

      {/* ClassyERP Text */}
      <text
        x="235"
        y="145"
        fontFamily="'Montserrat', 'Arial', sans-serif"
        fontWeight="700"
        fontSize="95"
        letterSpacing="-2"
      >
        <tspan fill={isDarkBackground ? '#ffffff' : '#0f172a'}>Classy</tspan>
        <tspan fill={isDarkBackground ? '#60a5fa' : '#0f62fe'}>ERP</tspan>
      </text>
    </svg>
  );
};
export default ClassyLogo;
