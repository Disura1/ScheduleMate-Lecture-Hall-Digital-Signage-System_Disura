import type { ReactNode } from 'react';

export function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-navy/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-navy mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-status-gray mb-4">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}