'use client'

import { useState } from 'react'
import { Habit, HabitHistory } from '@/lib/types'
import { getBestStreak, getTodayCompletionRate, getWeeklyAvgRate } from '@/lib/utils'
import HabitCard from './HabitCard'
import ProgressRing from './ProgressRing'
import HabitStatsPanel from './HabitStatsPanel'
import WeeklyHabitGrid from './WeeklyHabitGrid'
import EmptyState from './EmptyState'

interface HabitDashboardProps {
  habits: Habit[]
  todayHabits: Habit[]
  completedToday: Habit[]
  history: HabitHistory
  onToggle: (habitId: string) => void
  onDelete: (habitId: string) => void
  onAddNew: () => void
  getStreak: (habitId: string) => number
  isCompleted: (habitId: string) => boolean
}

export default function HabitDashboard({
  habits,
  todayHabits,
  completedToday,
  history,
  onToggle,
  onDelete,
  onAddNew,
  getStreak,
  isCompleted,
}: HabitDashboardProps) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const completionRate = getTodayCompletionRate(habits, history)
  const bestStreak = getBestStreak(habits, history)
  const weeklyRate = getWeeklyAvgRate(habits, history)

  const handleDeleteRequest = (habitId: string) => {
    if (pendingDelete === habitId) {
      onDelete(habitId)
      setPendingDelete(null)
    } else {
      setPendingDelete(habitId)
      setTimeout(() => setPendingDelete(null), 3000)
    }
  }

  if (habits.length === 0) {
    return <EmptyState onCreateFirst={onAddNew} />
  }

  return (
    <div className="space-y-5">
      {/* Top section: Progress ring + Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Ring */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center sm:w-52 flex-shrink-0">
          <ProgressRing percentage={completionRate} size={128} />
          <p className="text-[11px] text-white/30 mt-3 text-center">
            {completedToday.length} of {todayHabits.length} habits done
          </p>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <HabitStatsPanel
            total={habits.length}
            completedToday={completedToday.length}
            totalToday={todayHabits.length}
            bestStreak={bestStreak}
            weeklyRate={weeklyRate}
          />
        </div>
      </div>

      {/* Today's habits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Today&apos;s Habits
          </h2>
          {pendingDelete && (
            <span className="text-[11px] text-red-400 animate-pulse">
              Click delete again to confirm
            </span>
          )}
        </div>

        {todayHabits.length > 0 ? (
          <div className="space-y-2">
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={isCompleted(habit.id)}
                streak={getStreak(habit.id)}
                history={history}
                onToggle={() => onToggle(habit.id)}
                onDeleteRequest={() => handleDeleteRequest(habit.id)}
                deleteConfirmed={pendingDelete === habit.id}
              />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center text-white/25 text-sm">
            No habits scheduled for today.
          </div>
        )}
      </div>

      {/* Weekly grid */}
      <WeeklyHabitGrid habits={habits} history={history} />
    </div>
  )
}
