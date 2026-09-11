import { useEffect, useState } from 'react';
import { getSlideData, getDeviceId, type SlideData } from './api/signage';
import { SignageHeader } from './components/SignageHeader';
import { SlideDots } from './components/SlideDots';
import { OngoingSlide } from './slides/OngoingSlide';
import { UpcomingSlide } from './slides/UpcomingSlide';
import { CancelledSlide } from './slides/CancelledSlide';
import { RescheduledSlide } from './slides/RescheduledSlide';
import { pageCount } from './lib/paginate';

const SLIDE_DURATION_MS = 8_000;

type SlideKind = 'ongoing' | 'upcoming' | 'cancelled' | 'rescheduled';
const SLIDE_ORDER: SlideKind[] = ['ongoing', 'upcoming', 'cancelled', 'rescheduled'];

function App() {
  const [data, setData] = useState<SlideData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [activeSlide, setActiveSlide] = useState(0);
  const [deviceId] = useState(() => getDeviceId());

  useEffect(() => {
    if (!deviceId) return; // nothing to fetch — handled by the render below

    function fetchData() {
      getSlideData(deviceId)
        .then((newData) => { setData(newData); setError(null); })
        .catch((err) => setError(err.message));
    }
    fetchData();
    const pollInterval = setInterval(fetchData, 60_000);
    return () => clearInterval(pollInterval);
  }, [deviceId]);

  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Ongoing and Upcoming always show (even empty); Cancelled/Rescheduled only join when they have content (FR-18/FR-19)
  const slideQueue: { kind: SlideKind; page: number }[] = data
  ? SLIDE_ORDER.flatMap((kind) => {
      const sessions = data[kind];
      if (kind !== 'ongoing' && kind !== 'upcoming' && sessions.length === 0) return [];
      const pages = pageCount(sessions.length);
      return Array.from({ length: pages }, (_, page) => ({ kind, page }));
    })
  : [];

  useEffect(() => {
    if (slideQueue.length === 0) return;
    const rotationInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideQueue.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(rotationInterval);
  }, [slideQueue.length]);

  // If the slide list shrank (e.g. the cancelled slide disappeared) and our index is now out of range, snap back safely
  useEffect(() => {
    if (activeSlide >= slideQueue.length) setActiveSlide(0);
  }, [slideQueue.length, activeSlide]);

  if (!deviceId) {
    return (
      <div className="min-h-screen bg-signage-bg flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-signage-red text-lg font-semibold mb-2">No display configured</p>
          <p className="text-signage-text-dim text-sm">
            This screen needs a device ID. Open it as: <span className="text-signage-text">yourdomain.com/?device=DSP-XXXX</span>
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="min-h-screen bg-signage-bg flex items-center justify-center"><p className="text-signage-red">Error: {error}</p></div>;
  }
  if (!data) {
    return <div className="min-h-screen bg-signage-bg flex items-center justify-center"><p className="text-signage-text-dim">Loading…</p></div>;
  }

  const current = slideQueue[activeSlide];

  return (
    <div className="h-screen bg-signage-bg flex flex-col overflow-hidden">
      <SignageHeader location={data.location} now={now} />
      <div className="flex-1 overflow-hidden">
        {current?.kind === 'ongoing' && <OngoingSlide sessions={data.ongoing} page={current.page} />}
        {current?.kind === 'upcoming' && <UpcomingSlide sessions={data.upcoming} now={now} page={current.page} />}
        {current?.kind === 'cancelled' && <CancelledSlide sessions={data.cancelled} page={current.page} />}
        {current?.kind === 'rescheduled' && <RescheduledSlide sessions={data.rescheduled} page={current.page} />}
      </div>
      <SlideDots activeKind={current?.kind} />
    </div>
  );
}

export default App;