export default function DashboardLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-40 bg-gray-200 rounded mt-2 animate-pulse" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border animate-pulse"
            style={{
              borderColor: 'var(--border-whisper-professor)',
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div className="h-2.5 w-16 bg-gray-200 rounded" />
            <div className="h-8 w-12 bg-gray-200 rounded mt-2" />
            <div className="h-2.5 w-20 bg-gray-200 rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div
          className="lg:col-span-2 bg-white rounded-xl p-5 border animate-pulse"
          style={{ borderColor: 'var(--border-whisper-professor)' }}
        >
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-6 h-6 bg-gray-200 rounded" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="h-2.5 w-1/2 bg-gray-200 rounded" />
                </div>
                <div className="h-3 w-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div
            className="bg-white rounded-xl p-5 border h-32 animate-pulse"
            style={{ borderColor: 'var(--border-whisper-professor)' }}
          />
          <div
            className="bg-white rounded-xl p-5 border h-44 animate-pulse"
            style={{ borderColor: 'var(--border-whisper-professor)' }}
          />
        </div>
      </div>

      {/* Students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border animate-pulse"
            style={{ borderColor: 'var(--border-whisper-professor)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-2.5 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
