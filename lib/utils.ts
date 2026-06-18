import { Habit, HabitHistory } from './types'

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getLast7Days(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
}

export function isHabitDueToday(habit: Habit): boolean {
  if (habit.frequency === 'Daily') return true
  const today = new Date().getDay()
  if (habit.frequency === 'Weekdays') return today >= 1 && today <= 5
  if (habit.frequency === 'Custom' && habit.customDays) {
    return habit.customDays.includes(today)
  }
  return true
}

export function getStreak(habitId: string, history: HabitHistory): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getDateKey(d)
    if (history[key]?.[habitId] === true) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getBestStreak(habits: Habit[], history: HabitHistory): number {
  if (habits.length === 0) return 0
  return Math.max(...habits.map((h) => getStreak(h.id, history)))
}

export function getTodayCompletionRate(habits: Habit[], history: HabitHistory): number {
  const todayHabits = habits.filter(isHabitDueToday)
  if (todayHabits.length === 0) return 0
  const todayKey = getTodayKey()
  const completed = todayHabits.filter((h) => history[todayKey]?.[h.id] === true).length
  return Math.round((completed / todayHabits.length) * 100)
}

export function getEnergyScore(habitId: string, history: HabitHistory): number {
  const today = new Date()
  let completed = 0
  const lookback = 14
  for (let i = 0; i < lookback; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (history[getDateKey(d)]?.[habitId] === true) completed++
  }
  return Math.round((completed / lookback) * 100)
}

export function getWeeklyAvgRate(habits: Habit[], history: HabitHistory): number {
  if (habits.length === 0) return 0
  const days = getLast7Days()
  const rates = days.map((day) => {
    const key = getDateKey(day)
    const dayRecord = history[key] || {}
    const completed = habits.filter((h) => dayRecord[h.id] === true).length
    return habits.length > 0 ? (completed / habits.length) * 100 : 0
  })
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
}

export const CATEGORY_META: Record<
  string,
  { icon: string; color: string; bg: string; border: string }
> = {
  Health: {
    icon: '💊',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  Study: {
    icon: '📚',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  Fitness: {
    icon: '⚡',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  Finance: {
    icon: '💰',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  Personal: {
    icon: '🎯',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  Custom: {
    icon: '✨',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
}

export const DIFFICULTY_META: Record<string, { label: string; color: string; dot: string }> = {
  Easy: { label: 'Easy', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  Medium: { label: 'Medium', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  Hard: { label: 'Hard', color: 'text-red-400', dot: 'bg-red-400' },
}
