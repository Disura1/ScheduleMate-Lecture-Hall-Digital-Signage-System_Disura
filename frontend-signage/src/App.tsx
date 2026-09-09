import { useEffect, useState } from 'react';
import { getSlideData, type SlideData } from './api/signage';

function formatTime(isoString: string): string {
  return isoString.substring(11, 16);
}

function App() {
  const [data, setData] = useState<SlideData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSlideData()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-signage-bg flex items-center justify-center">
        <p className="text-signage-red">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-signage-bg flex items-center justify-center">
        <p className="text-signage-text-dim">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-signage-bg">
      <div className="h-32 bg-signage-header flex items-center justify-between px-12 border-b-2 border-signage-border-blue">
        <div className="text-signage-text text-3xl font-bold">
          {data.location.building} — Floor {data.location.floor} <span className="text-signage-accent-blue">{data.location.side} Side</span>
        </div>
        <div className="text-right">
          <div className="text-signage-text-dim text-sm mb-1">{new Date(data.currentTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="text-signage-text text-4xl font-bold">{new Date(data.currentTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <div className="px-12 pt-8">
        <h1 className="text-signage-text text-3xl font-bold mb-5">
          Ongoing <span className="text-signage-green">Lectures / Labs</span>
        </h1>

        <div className="grid grid-cols-3 gap-7">
          {data.ongoing.length === 0 ? (
            <p className="text-signage-text-faint text-lg">No ongoing sessions right now.</p>
          ) : (
            data.ongoing.map((s) => (
              <div key={s.id} className="bg-signage-card rounded-2xl p-7 border-l-4 border-signage-green">
                <div className="bg-signage-green-bg text-signage-green text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-4">
                  ONGOING NOW
                </div>
                <div className="text-signage-text text-2xl font-bold mb-1">{s.room.code}</div>
                <div className="text-signage-text-dim text-base mb-4">{s.module.code} — {s.module.name}</div>
                <div className="text-signage-text-dim text-sm mb-2"><b className="text-signage-text">{formatTime(s.startTime)} – {formatTime(s.endTime)}</b></div>
                <div className="text-signage-text-dim text-sm">Lecturer: <b className="text-signage-text">{s.lecturer.name}</b></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;