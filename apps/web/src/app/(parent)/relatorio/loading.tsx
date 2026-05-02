export default function RelatorioLoading() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-6 font-nunito">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-28 bg-warm-200 rounded animate-pulse" />
        <div className="h-9 w-44 bg-warm-200 rounded-lg animate-pulse" />
      </div>

      <div
        className="bg-white rounded-aurora p-8 border animate-pulse"
        style={{ borderColor: 'var(--border-whisper-parent)' }}
      >
        {/* Header */}
        <div className="border-b pb-6 mb-6" style={{ borderColor: 'var(--border-whisper-parent)' }}>
          <div className="h-3 w-16 bg-warm-200 rounded mb-2" />
          <div className="h-8 w-72 bg-warm-200 rounded mb-2" />
          <div className="h-4 w-48 bg-warm-200 rounded" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl p-4 border h-20 bg-warm-100"
                 style={{ borderColor: 'var(--border-whisper-parent)' }} />
          ))}
        </div>

        {/* Subjects bars */}
        <div className="mb-8">
          <div className="h-3 w-32 bg-warm-200 rounded mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="h-3 w-24 bg-warm-200 rounded" />
                  <div className="h-3 w-20 bg-warm-200 rounded" />
                </div>
                <div className="h-2 bg-warm-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Lessons list */}
        <div>
          <div className="h-3 w-32 bg-warm-200 rounded mb-3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4 h-24"
                   style={{ borderColor: 'var(--border-whisper-parent)' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
