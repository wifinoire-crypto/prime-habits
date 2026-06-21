# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

There is no test suite configured.

## Architecture

This is a fully client-side Next.js 14 app (App Router) with no backend, API routes, or external data sources. All state is persisted in `localStorage` under the key `prime-habits-v1`.

**Data flow:**
- `lib/types.ts` — all shared TypeScript interfaces (`Habit`, `HabitHistory`, `AppState`)
- `lib/storage.ts` — thin `loadState`/`saveState` wrappers around `localStorage`; always guards against `typeof window === 'undefined'` for SSR safety
- `lib/utils.ts` — pure functions for date keys, streak calculation, completion rates, energy scores, and display metadata (`CATEGORY_META`, `DIFFICULTY_META`)
- `hooks/useHabits.ts` — the single source of truth for all habit state; loads from storage on mount, persists on every change, and exposes `addHabit`, `deleteHabit`, `toggleHabit`, `isCompletedToday`, `getHabitStreak`
- `components/` — UI only; components receive data and callbacks from `useHabits` via `HabitDashboard` or `PrimeHabitsPage`

**Component hierarchy:**
```
app/page.tsx
└── PrimeHabitsPage       (modal open/close state)
    └── HabitDashboard    (consumes useHabits, passes props down)
        ├── HabitStatsPanel
        ├── HabitCard[]
        │   └── WeeklyHabitGrid / ProgressRing
        └── EmptyState
```
`HabitCreatorModal` is rendered by `PrimeHabitsPage` and receives `addHabit` from the hook.

## Key Conventions

**Habit IDs** are generated as `` `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` ``.

**Date keys** are always `'YYYY-MM-DD'` strings produced by `getTodayKey()` / `getDateKey(date)` in `lib/utils.ts`. Never construct date keys manually.

**Frequency logic** lives exclusively in `isHabitDueToday` (`lib/utils.ts`). `customDays` is an array of JS `Date.getDay()` values (0 = Sunday, 6 = Saturday), used only when `frequency === 'Custom'`.

**Streak calculation** (`getStreak`) walks backwards day-by-day through `history` and breaks on the first missing entry — it does not skip non-scheduled days.

**Styling** uses Tailwind utility classes throughout. Custom animations (`modal-in`, `fade-in`, `glow-pulse`) and glass-morphism component classes (`.glass`, `.glass-card`, etc.) are defined in `app/globals.css`. The background color `#08080f` is the design baseline — keep new UI on the dark theme.

**`"use client"`** is required on any component or hook that uses browser APIs or React state/effects. The `lib/` utilities are framework-agnostic and must stay importable in server contexts.

## Obsolete Files

`index.html`, `styles.css`, and `app.js` in the project root are legacy files from before the Next.js migration. They are not part of the running app and the README references them incorrectly.
