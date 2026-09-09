export function EmptySlideCard({ message }: { message: string }) {
  return (
    <div className="bg-signage-card rounded-2xl border-l-4 border-signage-text-faint/30 flex items-center justify-center p-7 min-h-40">
      <p className="text-signage-text-faint text-base text-center">{message}</p>
    </div>
  );
}