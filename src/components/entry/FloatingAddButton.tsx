'use client';

import { useState } from 'react';
import { QuickEntrySheet } from './QuickEntrySheet';

export function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-clay-500 to-clay-700 text-white shadow-lg shadow-clay-500/30 flex items-center justify-center touch-active hover:shadow-xl hover:shadow-clay-500/40 transition-all duration-200"
        aria-label="Add transaction"
        id="fab-add-transaction"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Entry Sheet */}
      <QuickEntrySheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
