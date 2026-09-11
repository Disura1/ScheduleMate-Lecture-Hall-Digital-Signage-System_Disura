import type { ReactNode } from 'react';

export function SlideShell({ title, pageLabel, dense, children }: { title: ReactNode; pageLabel?: string; dense: boolean; children: ReactNode }) {
  return (
    <div className="h-full flex flex-col px-12">
      <div className="pt-8 pb-5 flex-shrink-0 flex items-baseline gap-3">
        <h1 className="text-signage-text text-3xl font-bold">{title}</h1>
        {pageLabel && <span className="text-signage-text-faintest text-base">{pageLabel}</span>}
      </div>
      <div className={`flex-1 min-h-0 ${dense ? '' : 'flex items-center'}`}>
        <div className={`grid grid-cols-3 gap-5 w-full h-full ${dense ? 'grid-rows-2' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}