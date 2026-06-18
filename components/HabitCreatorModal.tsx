'use client'

import { useState } from 'react'
import { HabitCategory, HabitFrequency, HabitDifficulty } from '@/lib/types'
import { CreateHabitInput } from '@/hooks/useHabits'
import { CATEGORY_META } from '@/lib/utils'

interface HabitCreatorModalProps {
  onClose: () => void
  onSave: (input: CreateHabitInput) => void
}

const CATEGORIES: HabitCategory[] = ['Health', 'Study', 'Fitness', 'Finance', 'Personal', 'Custom']
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DIFFICULTIES: HabitDifficulty[] = ['Easy', 'Medium', 'Hard']

const DIFFICULTY_SELECTED: Record<HabitDifficulty, string> = {
  Easy: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  Medium: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  Hard: 'bg-red-500/20 border-red-500/40 text-red-300',
}

export default function HabitCreatorModal({ onClose, onSave }: HabitCreatorModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<HabitCategory>('Health')
  const [frequency, setFrequency] = useState<HabitFrequency>('Daily')
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('Medium')
  const [goal, setGoal] = useState('')

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      category,
      frequency,
      customDays: frequency === 'Custom' ? customDays : undefined,
      difficulty,
      goal: goal.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="animate-modal-in relative w-full max-w-md bg-[#0e0e1a] border border-white/10 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">New Habit</h2>
            <p className="text-white/35 text-xs mt-0.5">Stack your discipline</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-white/35 hover:text-white transition-all"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read 30 minutes"
              required
              autoFocus
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all duration-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat]
                const selected = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all duration-200
                      ${selected
                        ? `${meta.bg} ${meta.border} ${meta.color}`
                        : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
                      }
                    `}
                  >
                    <span>{meta.icon}</span>
                    <span>{cat}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              Frequency
            </label>
            <div className="flex gap-2">
              {(['Daily', 'Weekdays', 'Custom'] as HabitFrequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`
                    flex-1 py-2 rounded-xl border text-xs font-medium transition-all duration-200
                    ${frequency === freq
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]'
                    }
                  `}
                >
                  {freq}
                </button>
              ))}
            </div>

            {frequency === 'Custom' && (
              <div className="flex gap-1.5 mt-2.5">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`
                      flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200
                      ${customDays.includes(i)
                        ? 'bg-violet-500/30 border border-violet-500/50 text-violet-200'
                        : 'bg-white/[0.04] border border-white/[0.06] text-white/25 hover:bg-white/[0.08]'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              Difficulty
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`
                    flex-1 py-2 rounded-xl border text-xs font-medium transition-all duration-200
                    ${difficulty === diff
                      ? DIFFICULTY_SELECTED[diff]
                      : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]'
                    }
                  `}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Goal (optional) */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              Goal{' '}
              <span className="text-white/20 normal-case font-normal tracking-normal">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Finish 12 books this year"
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all duration-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              boxShadow: name.trim() ? '0 0 24px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            Add Habit
          </button>
        </form>
      </div>
    </div>
  )
}
