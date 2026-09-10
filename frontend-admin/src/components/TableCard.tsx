import type { ReactNode } from 'react';

export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="overflow-y-auto flex-1">{children}</div>
    </div>
  );
}