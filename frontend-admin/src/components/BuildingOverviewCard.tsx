export function BuildingOverviewCard({
  name, ongoingCount, totalRooms, active, onClick,
}: { name: string; ongoingCount: number; totalRooms: number; active: boolean; onClick: () => void }) {
  const pct = totalRooms > 0 ? Math.round((ongoingCount / totalRooms) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-xl shadow-sm p-5 flex-1 border-2 transition-colors ${active ? 'border-brand-blue' : 'border-transparent hover:border-gray-200'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-bold text-navy">{name}</div>
          <div className="text-xs text-status-gray">{ongoingCount} of {totalRooms} rooms occupied</div>
        </div>
        <div className="text-2xl font-bold text-brand-blue">{pct}%</div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </button>
  );
}