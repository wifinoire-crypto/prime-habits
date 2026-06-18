export type HabitCategory = 'Health' | 'Study' | 'Fitness' | 'Finance' | 'Personal' | 'Custom'

export type HabitFrequency = 'Daily' | 'Weekdays' | 'Custom'

export type HabitDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface Habit {
  id: string
  name: string
  category: HabitCategory
  frequency: HabitFrequency
  customDays?: number[] // 0 = Sunday, 6 = Saturday
  difficulty: HabitDifficulty
  goal?: string
  createdAt: string // ISO date string
}

export interface HabitRecord {
  [habitId: string]: boolean
}

export interface HabitHistory {
  [dateKey: string]: HabitRecord // 'YYYY-MM-DD' -> { habitId: bool }
}

export interface AppState {
  habits: Habit[]
  history: HabitHistory
}
