import { useEffect, useRef, useState } from 'react';

export function NotificationTicker({ messages }: { messages: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [anim, setAnim] = useState<{ startPx: number; endPx: number; duration: number; keyframeName: string } | null>(null);

  const content = messages.join('   •   ');

  useEffect(() => {
    if (!containerRef.current || !contentRef.current || messages.length === 0) {
      setAnim(null);
      return;
    }
    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = contentRef.current.offsetWidth;
    const startPx = containerWidth;      // fully off-screen to the right
    const endPx = -contentWidth;         // fully off-screen to the left
    const totalDistance = startPx - endPx;
    const duration = Math.max(10, totalDistance / 80); // ~80px/sec, so longer messages take proportionally longer
    const keyframeName = `ticker-${Math.round(startPx)}-${Math.abs(Math.round(endPx))}`;
    setAnim({ startPx, endPx, duration, keyframeName });
  }, [content, messages.length]);

  if (messages.length === 0) return null;

  return (
    <div ref={containerRef} className="h-11 bg-signage-header border-t-2 border-signage-border-blue overflow-hidden relative shrink-0">
      <span
        ref={contentRef}
        className="text-signage-text text-base whitespace-nowrap absolute left-0 leading-11"
        style={
          anim
            ? { transform: `translateX(${anim.startPx}px)`, animation: `${anim.keyframeName} ${anim.duration}s linear infinite` }
            : { visibility: 'hidden' }
        }
      >
        {content}
      </span>
      {anim && (
        <style>{`
          @keyframes ${anim.keyframeName} {
            from { transform: translateX(${anim.startPx}px); }
            to { transform: translateX(${anim.endPx}px); }
          }
        `}</style>
      )}
    </div>
  );
}