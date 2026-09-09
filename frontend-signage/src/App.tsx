import { useEffect, useState } from 'react';
import { getSlideData, type SlideData } from './api/signage';
import { SignageHeader } from './components/SignageHeader';
import { SlideDots } from './components/SlideDots';
import { OngoingSlide } from './slides/OngoingSlide';
import { UpcomingSlide } from './slides/UpcomingSlide';
import { CancelledSlide } from './slides/CancelledSlide';
import { RescheduledSlide } from './slides/RescheduledSlide';

const SLIDE_DURATION_MS = 8_000;

type SlideKind = 'ongoing' | 'upcoming' | 'cancelled' | 'rescheduled';
const SLIDE_ORDER: SlideKind[] = ['ongoing', 'upcoming', 'cancelled', 'rescheduled'];

function App() {
  const [data, setData] = useState<SlideData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    function fetchData() {
      getSlideData()
        .then((newData) => { setData(newData); setError(null); })
        .catch((err) => setError(err.message));
    }
    fetchData();
    const pollInterval = setInterval(fetchData, 60_000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Ongoing and Upcoming always show (even empty); Cancelled/Rescheduled only join when they have content (FR-18/FR-19)
  const availableSlides: SlideKind[] = data
    ? SLIDE_ORDER.filter((kind) => {
        if (kind === 'ongoing' || kind === 'upcoming') return true;
        if (kind === 'cancelled') return data.cancelled.length > 0;
        return data.rescheduled.length > 0;
      })
    : [];

  useEffect(() => {
    if (availableSlides.length === 0) return;
    const rotationInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % availableSlides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(rotationInterval);
  }, [availableSlides.length]);

  // If the slide list shrank (e.g. the cancelled slide disappeared) and our index is now out of range, snap back safely
  useEffect(() => {
    if (activeSlide >= availableSlides.length) setActiveSlide(0);
  }, [availableSlides.length, activeSlide]);

  if (error) {
    return <div className="min-h-screen bg-signage-bg flex items-center justify-center"><p className="text-signage-red">Error: {error}</p></div>;
  }
  if (!data) {
    return <div className="min-h-screen bg-signage-bg flex items-center justify-center"><p className="text-signage-text-dim">Loading…</p></div>;
  }

  const currentKind = availableSlides[activeSlide];

  return (
    <div className="min-h-screen bg-signage-bg pb-8">
      <SignageHeader location={data.location} now={now} />

      {currentKind === 'ongoing' && <OngoingSlide sessions={data.ongoing} />}
      {currentKind === 'upcoming' && <UpcomingSlide sessions={data.upcoming} now={now} />}
      {currentKind === 'cancelled' && <CancelledSlide sessions={data.cancelled} />}
      {currentKind === 'rescheduled' && <RescheduledSlide sessions={data.rescheduled} />}

      <SlideDots activeIndex={activeSlide} />
    </div>
  );
}

export default App;