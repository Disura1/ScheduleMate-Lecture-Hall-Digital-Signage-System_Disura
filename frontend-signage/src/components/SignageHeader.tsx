export function SignageHeader({ location, now }: { location: { building: string; floor: number; side: string }; now: Date }) {
  return (
    <div className="h-32 bg-signage-header flex items-center justify-between px-12 border-b-2 border-signage-border-blue">
      <div className="text-signage-text text-3xl font-bold">
        {location.building} — Floor {location.floor} <span className="text-signage-accent-blue">{location.side} Side</span>
      </div>
      <div className="text-right">
        <div className="text-signage-text-dim text-sm mb-1">
          {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="text-signage-text text-4xl font-bold">
          {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}