'use client'

import { useState, useEffect, useCallback } from 'react'
import { Habit, HabitHistory, HabitCategory, HabitFrequency, HabitDifficulty } from '@/lib/types'
import { loadState, saveState } from '@/lib/storage'
import { getTodayKey, getStreak, isHabitDueToday } from '@/lib/utils'

export interface CreateHabitInput {
  name: string
  category: HabitCategory
  frequency: HabitFrequency
  customDays?: number[]
  difficulty: HabitDifficulty
  goal?: string
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [history, setHistory] = useState<HabitHistory>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const state = loadState()
    setHabits(state.habits)
    setHistory(state.history)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    saveState({ habits, history })
  }, [habits, history, loaded])

  const addHabit = useCallback((input: CreateHabitInput) => {
    const habit: Habit = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...input,
      createdAt: new Date().toISOString(),
    }
    setHabits((prev) => [...prev, habit])
  }, [])

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
    setHistory((prev) => {
      const next = { ...prev }
      for (const date of Object.keys(next)) {
        if (next[date][habitId] !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [habitId]: _, ...rest } = next[date]
          next[date] = rest
        }
      }
      return next
    })
  }, [])

  const toggleHabit = useCallback((habitId: string) => {
    const todayKey = getTodayKey()
    setHistory((prev) => {
      const dayRecord = prev[todayKey] || {}
      return {
        ...prev,
        [todayKey]: {
          ...dayRecord,
          [habitId]: !dayRecord[habitId],
        },
      }
    })
  }, [])

  const isCompletedToday = useCallback(
    (habitId: string): boolean => {
      return history[getTodayKey()]?.[habitId] === true
    },
    [history]
  )

  const getHabitStreak = useCallback(
    (habitId: string): number => getStreak(habitId, history),
    [history]
  )

  const todayHabits = habits.filter(isHabitDueToday)
  const todayKey = getTodayKey()
  const completedToday = todayHabits.filter((h) => history[todayKey]?.[h.id] === true)

  return {
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
  }
}
