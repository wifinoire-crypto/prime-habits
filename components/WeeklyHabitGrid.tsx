'use client'

import { Habit, HabitHistory } from '@/lib/types'
import { getLast7Days, getDateKey, CATEGORY_META } from '@/lib/utils'

interface WeeklyHabitGridProps {
  habits: Habit[]
  history: HabitHistory
}

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function WeeklyHabitGrid({ habits, history }: WeeklyHabitGridProps) {
  if (habits.length === 0) return null

  const last7 = getLast7Days()
  const todayKey = getDateKey(new Date())

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">
        Weekly Activity
      </h3>

      {/* Day header row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-shrink-0" style={{ width: 140 }} />
        {last7.map((day) => {
          const key = getDateKey(day)
          const isToday = key === todayKey
          return (
            <div key={key} className="flex-1 flex justify-center">
              <span
                className={`text-[11px] font-medium ${
                  isToday ? 'text-violet-400' : 'text-white/25'
                }`}
              >
                {DAY_ABBR[day.getDay()]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Habit rows */}
      <div className="space-y-2">
        {habits.map((habit) => {
          const cat = CATEGORY_META[habit.category] ?? CATEGORY_META.Custom
          return (
            <div key={habit.id} className="flex items-center gap-2">
              {/* Name */}
              <div
                className="flex-shrink-0 flex items-center gap-1.5 overflow-hidden"
                style={{ width: 140 }}
              >
                <span className="text-xs flex-shrink-0">{cat.icon}</span>
                <span className="text-xs text-white/50 truncate">{habit.name}</span>
              </div>

              {/* Day cells */}
              {last7.map((day) => {
                const key = getDateKey(day)
                const done = history[key]?.[habit.id] === true
                const isToday = key === todayKey
                return (
                  <div key={key} className="flex-1 flex justify-center">
                    <div
                      className={`w-6 h-6 rounded-md transition-all duration-300 ${
                        done
                          ? 'shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                          : isToday
                          ? 'border border-white/15'
                          : ''
                      }`}
                      style={
                        done
                          ? { background: 'linear-gradient(135deg, #7c3aed, #0891b2)' }
                          : { background: 'rgba(255,255,255,0.04)' }
                      }
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
