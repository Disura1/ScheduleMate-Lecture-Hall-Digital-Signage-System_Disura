const SLIDE_LABELS = ['Ongoing', 'Upcoming', 'Cancelled', 'Rescheduled'];
const SLIDE_COLORS = ['var(--color-signage-green)', 'var(--color-signage-blue)', 'var(--color-signage-red)', 'var(--color-signage-amber)'];

export function SlideDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center gap-3 px-12 py-7">
      {SLIDE_LABELS.map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded-full transition-all"
          style={{
            width: i === activeIndex ? '2.25rem' : '0.875rem',
            backgroundColor: i === activeIndex ? SLIDE_COLORS[i] : 'var(--color-signage-dot-inactive)',
          }}
        />
      ))}
      <span className="text-signage-text-faintest text-sm ml-3">
        Ongoing → Upcoming → Cancelled (if any) → Rescheduled (if any) — 8s per slide
      </span>
    </div>
  );
}