import React from 'react';

export const VaakaiLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M25 40 L50 85 L75 40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 5 L54 18 L67 22 L54 26 L50 39 L46 26 L33 22 L46 18 Z" fill="currentColor" />
  </svg>
);
