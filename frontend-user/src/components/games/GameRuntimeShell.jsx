import React from 'react';

/**
 * Shared full-screen shell for Slotopol-powered games.
 * The game engine remains authoritative; this component only provides
 * responsive presentation and viewport-safe sizing for desktop and mobile.
 */
export default function GameRuntimeShell({ children, className = '' }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex min-h-[100dvh] flex-col overflow-hidden bg-[#05070d] text-white ${className}`}
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </div>
  );
}
