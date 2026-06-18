'use client'

import { useState } from 'react'
import { useHabits } from '@/hooks/useHabits'
import HabitDashboard from './HabitDashboard'
import HabitCreatorModal from './HabitCreatorModal'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PrimeHabitsPage() {
  const [showModal, setShowModal] = useState(false)
  const {
    habits,
    history,
    loaded,
    todayHabits,
    completedToday,
    addHabit,
    deleteHabit,
    toggleHabit,
    isCompletedToday,
    getHabitStreak,
  } = useHabits()

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080f] relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-15%] left-[15%] w-[700px] h-[700px] rounded-full opacity-60"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-50"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-16">
        {/* Header */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className="text-2xl select-none"
                style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.6))' }}
              >
                ⚡
              </span>
              <h1 className="text-2xl font-bold gradient-text tracking-tight">Prime Habits</h1>
            </div>
            <p className="text-white/25 text-sm pl-9">{formatDate(new Date())}</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:border-white/[0.14] hover:text-white transition-all duration-200 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Habit
          </button>
        </header>

        {/* Dashboard */}
        <HabitDashboard
          habits={habits}
          todayHabits={todayHabits}
          completedToday={completedToday}
          history={history}
          onToggle={toggleHabit}
          onDelete={deleteHabit}
          onAddNew={() => setShowModal(true)}
          getStreak={getHabitStreak}
          isCompleted={isCompletedToday}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <HabitCreatorModal onClose={() => setShowModal(false)} onSave={addHabit} />
      )}
    </div>
  )
}
