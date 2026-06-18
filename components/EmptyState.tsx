'use client'

interface EmptyStateProps {
  onCreateFirst: () => void
}

export default function EmptyState({ onCreateFirst }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-4">
      <div
        className="text-7xl mb-8 select-none"
        style={{ filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.4))' }}
      >
        🌌
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">No habits yet</h2>
      <p className="text-white/35 max-w-xs mb-8 text-sm leading-relaxed">
        Your discipline cockpit is empty. Add your first habit and start building the version of
        yourself you keep promising.
      </p>

      <button
        onClick={onCreateFirst}
        className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 hover:border-violet-500/50 hover:text-violet-200 transition-all duration-200 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add your first habit
      </button>

      {/* Decorative dots */}
      <div className="flex gap-2 mt-12">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/10"
            style={{ opacity: 0.3 + i * 0.1 }}
          />
        ))}
      </div>
    </div>
  )
}
