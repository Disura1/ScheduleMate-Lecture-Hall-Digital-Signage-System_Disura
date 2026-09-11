type SlideKind = 'ongoing' | 'upcoming' | 'cancelled' | 'rescheduled';

const SLIDES: { kind: SlideKind; label: string; color: string }[] = [
  { kind: 'ongoing', label: 'Ongoing', color: 'var(--color-signage-green)' },
  { kind: 'upcoming', label: 'Upcoming', color: 'var(--color-signage-blue)' },
  { kind: 'cancelled', label: 'Cancelled', color: 'var(--color-signage-red)' },
  { kind: 'rescheduled', label: 'Rescheduled', color: 'var(--color-signage-amber)' },
];

export function SlideDots({ activeKind }: { activeKind: SlideKind | undefined }) {
  return (
    <div className="flex items-center gap-3 px-12 py-7">
      {SLIDES.map((s) => (
        <div
          key={s.kind}
          className="h-3.5 rounded-full transition-all"
          style={{
            width: s.kind === activeKind ? '2.25rem' : '0.875rem',
            backgroundColor: s.kind === activeKind ? s.color : 'var(--color-signage-dot-inactive)',
          }}
        />
      ))}
      <span className="text-signage-text-faintest text-sm ml-3">
        Ongoing → Upcoming → Cancelled (if any) → Rescheduled (if any) — 8s per slide
      </span>
    </div>
  );
}