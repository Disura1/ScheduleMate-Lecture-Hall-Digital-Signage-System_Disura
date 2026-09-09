import { useEffect, useState } from 'react';
import { getSlideData, type SlideData } from './api/signage';
import { SignageHeader } from './components/SignageHeader';
import { SlideDots } from './components/SlideDots';
import { OngoingSlide } from './slides/OngoingSlide';
import { UpcomingSlide } from './slides/UpcomingSlide';
import { CancelledSlide } from './slides/CancelledSlide';
import { RescheduledSlide } from './slides/RescheduledSlide';

function App() {
  const [data, setData] = useState<SlideData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

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

  if (error) {
    return <div className="min-h-screen bg-signage-bg flex items-center justify-center"><p className="text-signage-red">Error: {error}</p></div>;
  }
  if (!data) {
    return <div className="min-h-screen bg-signage-bg flex items-center justify-center"><p className="text-signage-text-dim">Loading…</p></div>;
  }

  // Temporary: showing all four stacked, just to verify each one renders correctly — Stage 4 replaces this with rotation
  return (
    <div className="min-h-screen bg-signage-bg pb-8">
      <SignageHeader location={data.location} now={now} />
      <OngoingSlide sessions={data.ongoing} />
      <UpcomingSlide sessions={data.upcoming} now={now} />
      <CancelledSlide sessions={data.cancelled} />
      <RescheduledSlide sessions={data.rescheduled} />
      <SlideDots activeIndex={0} />
    </div>
  );
}

export default App;