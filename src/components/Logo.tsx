import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="earFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {/* Outer Circle with Gradient */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#logoGradient)"
        opacity="0.08"
      />

      {/* Main Ear Shape - Elegant Curved Design */}
      <path
        d="M 36 32
           C 28 38 28 52 32 68
           C 34 76 40 82 46 80
           C 48 79 49 76 49 68
           L 49 50
           C 49 42 50 36 50 30
           C 50 28 52 28 52 30
           C 52 36 53 42 53 50
           L 53 68
           C 53 76 54 79 56 80
           C 62 82 68 76 70 68
           C 74 52 74 38 66 32
           C 60 26 50 20 50 20
           C 50 20 42 26 36 32"
        fill="url(#earFillGradient)"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Helix - Outer Curve */}
      <path
        d="M 38 35 C 32 40 32 52 35 65"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Anti-helix - Inner Curve */}
      <path
        d="M 45 40 C 44 46 44 55 46 66 C 47 72 49 74 50 75"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Concha - Inner Ear */}
      <ellipse
        cx="50"
        cy="52"
        rx="8"
        ry="12"
        fill="white"
        opacity="0.15"
      />

      {/* Ear Canal */}
      <ellipse
        cx="50"
        cy="54"
        rx="3.5"
        ry="4.5"
        fill="white"
        opacity="0.25"
      />

      {/* Earlobe */}
      <ellipse
        cx="50"
        cy="78"
        rx="10"
        ry="6"
        fill="url(#earFillGradient)"
        opacity="0.8"
      />

      {/* Sound Waves - Elegant Arcs */}
      <path
        d="M 68 40 C 75 45 75 55 68 60"
        stroke="url(#waveGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M 73 35 C 82 42 82 58 73 65"
        stroke="url(#waveGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 78 30 C 89 39 89 61 78 70"
        stroke="url(#waveGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Sparkle Effects */}
      <circle
        cx="34"
        cy="36"
        r="2.2"
        fill="url(#waveGradient)"
        opacity="1"
      />
      <circle
        cx="31"
        cy="33"
        r="1.2"
        fill="url(#waveGradient)"
        opacity="0.7"
      />
      <circle
        cx="37"
        cy="33"
        r="0.8"
        fill="url(#waveGradient)"
        opacity="0.5"
      />
    </svg>
  );
};
