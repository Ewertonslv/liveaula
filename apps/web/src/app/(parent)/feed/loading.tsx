export default function FeedLoading() {
  return (
    <div className="pt-6 space-y-4">
      {/* Title skeleton */}
      <div className="h-8 w-56 bg-warm-200 rounded animate-pulse" />
      <div className="h-4 w-72 bg-warm-200 rounded animate-pulse" />

      {/* Card skeletons with same aurora gradient as real cards */}
      <div className="space-y-3 mt-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-aurora-afternoon rounded-aurora p-5 border animate-pulse"
            style={{
              borderColor: 'var(--border-whisper-parent)',
              animationDelay: `${i * 100}ms`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-warm-200" />
                <div>
                  <div className="h-3.5 w-28 bg-warm-200 rounded" />
                  <div className="h-2.5 w-16 bg-warm-200 rounded mt-1.5" />
                </div>
              </div>
              <div className="h-5 w-20 bg-warm-200 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-warm-200 rounded" />
              <div className="h-3 w-5/6 bg-warm-200 rounded" />
            </div>
            <div className="flex items-center gap-2 pt-3">
              <div className="h-5 w-5 bg-warm-200 rounded" />
              <div className="h-3 w-12 bg-warm-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
