'use client'

import { Habit, HabitHistory } from '@/lib/types'
import { CATEGORY_META, DIFFICULTY_META, getEnergyScore } from '@/lib/utils'

interface HabitCardProps {
  habit: Habit
  completed: boolean
  streak: number
  history: HabitHistory
  onToggle: () => void
  onDeleteRequest: () => void
  deleteConfirmed: boolean
}

export default function HabitCard({
  habit,
  completed,
  streak,
  history,
  onToggle,
  onDeleteRequest,
  deleteConfirmed,
}: HabitCardProps) {
  const cat = CATEGORY_META[habit.category] ?? CATEGORY_META.Custom
  const diff = DIFFICULTY_META[habit.difficulty] ?? DIFFICULTY_META.Easy
  const energy = getEnergyScore(habit.id, history)
  const hasStreak = streak > 0
  const highStreak = streak >= 7

  return (
    <div
      className={`
        group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-300
        ${
          completed
            ? 'bg-white/[0.06] border-white/[0.10]'
            : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.09]'
        }
      `}
    >
      {/* Completion button */}
      <button
        onClick={onToggle}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        className={`
          flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center
          transition-all duration-300 select-none
          ${
            completed
              ? 'border-transparent shadow-[0_0_18px_rgba(124,58,237,0.55)]'
              : 'border-white/20 hover:border-violet-400/60 hover:shadow-[0_0_10px_rgba(124,58,237,0.25)]'
          }
        `}
        style={
          completed
            ? { background: 'linear-gradient(135deg, #7c3aed, #0891b2)' }
            : undefined
        }
      >
        {completed && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Habit info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm leading-none">{cat.icon}</span>
          <span
            className={`font-semibold text-[15px] leading-snug truncate transition-all duration-300 ${
              completed ? 'text-white/40 line-through decoration-white/20' : 'text-white'
            }`}
          >
            {habit.name}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${cat.bg} ${cat.border} ${cat.color}`}
          >
            {habit.category}
          </span>

          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            <span className={`text-[11px] ${diff.color}`}>{diff.label}</span>
          </span>

          {habit.goal && (
            <span className="text-[11px] text-white/25 italic truncate max-w-[130px]">
              {habit.goal}
            </span>
          )}
        </div>
      </div>

      {/* Right: energy + streak + delete */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Energy bar (desktop only) */}
        <div className="hidden sm:flex flex-col items-end gap-1 w-14">
          <span className="text-[10px] text-white/25 uppercase tracking-wide">energy</span>
          <div className="w-full h-1 rounded-full bg-white/[0.07] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${energy}%`,
                background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
              }}
            />
          </div>
          <span className="text-[10px] text-white/30">{energy}%</span>
        </div>

        {/* Streak */}
        <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
          <span
            className="text-lg leading-none select-none"
            style={{
              filter: highStreak
                ? 'drop-shadow(0 0 6px rgba(251,146,60,0.9))'
                : hasStreak
                ? 'drop-shadow(0 0 3px rgba(251,146,60,0.5))'
                : 'none',
            }}
          >
            {hasStreak ? '🔥' : '·'}
          </span>
          <span className="text-[11px] font-bold text-white/50 leading-none">{streak}</span>
        </div>

        {/* Delete */}
        <button
          onClick={onDeleteRequest}
          aria-label="Delete habit"
          className={`
            p-1.5 rounded-lg transition-all duration-200
            ${
              deleteConfirmed
                ? 'opacity-100 bg-red-500/25 text-red-400 border border-red-500/30'
                : 'opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-white/25 hover:text-red-400'
            }
          `}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
