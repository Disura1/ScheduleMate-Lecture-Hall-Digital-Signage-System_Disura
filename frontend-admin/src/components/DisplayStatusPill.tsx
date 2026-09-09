export function DisplayStatusPill({ lastSeenAt }: { lastSeenAt: string | null }) {
  if (!lastSeenAt) {
    return <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-status-gray-bg text-status-gray">Never Seen</span>;
  }

  const minutesAgo = (Date.now() - new Date(lastSeenAt).getTime()) / 60000;
  const isOnline = minutesAgo <= 5; // matches Addendum 2's "offline after 5 min" rule

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${isOnline ? 'bg-status-green-bg text-status-green' : 'bg-status-red-bg text-status-red'}`}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}

export function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return 'Never';
  const minutesAgo = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 60000);
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo === 1) return '1 min ago';
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  return `${hoursAgo} hr${hoursAgo === 1 ? '' : 's'} ago`;
}