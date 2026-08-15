import React from 'react';

export const VpIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={`inline-block text-red-500 shrink-0 ${className}`}
    aria-label="VP Icon"
  >
    <path d="M50 0 L100 25 L80 100 L50 85 L20 100 L0 25 Z" fill="#ff4655" />
    <path d="M50 20 L80 35 L68 80 L50 70 L32 80 L20 35 Z" fill="#0f1923" />
    <path d="M50 35 L65 45 L58 65 L50 60 L42 65 L35 45 Z" fill="#ffffff" />
  </svg>
);
