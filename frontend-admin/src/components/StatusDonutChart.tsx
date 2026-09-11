import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_META = [
  { key: 'ONGOING_NOW', label: 'Ongoing Now', color: '#1E9E5A' },
  { key: 'AVAILABLE', label: 'Available', color: '#8A93A3' },
  { key: 'UPCOMING_SOON', label: 'Upcoming Soon', color: '#D98A11' },
  { key: 'TEMPORARILY_UNAVAILABLE', label: 'Temporarily Unavailable', color: '#D93025' },
];

export function StatusDonutChart({ counts }: { counts: Record<string, number> }) {
  const data = STATUS_META.map((s) => ({ name: s.label, value: counts[s.key] ?? 0, color: s.color }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="text-sm font-bold text-navy mb-3">Campus Room Status</div>
      {total === 0 ? (
        <div className="h-40 flex items-center justify-center text-status-gray text-sm">No room data</div>
      ) : (
        <div className="flex items-center gap-3">
          <div style={{ width: '45%', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={35} outerRadius={60} paddingAngle={2}>
                  {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-status-gray flex-1">{d.name}</span>
                <span className="font-semibold text-navy">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}