'use client'

interface Stat {
  label: string
  value: string | number
  icon: string
  glow: string
}

interface HabitStatsPanelProps {
  total: number
  completedToday: number
  totalToday: number
  bestStreak: number
  weeklyRate: number
}

export default function HabitStatsPanel({
  total,
  completedToday,
  totalToday,
  bestStreak,
  weeklyRate,
}: HabitStatsPanelProps) {
  const stats: Stat[] = [
    {
      label: 'Total Habits',
      value: total,
      icon: '⚡',
      glow: 'rgba(167,139,250,0.3)',
    },
    {
      label: "Done Today",
      value: `${completedToday}/${totalToday}`,
      icon: '✓',
      glow: 'rgba(52,211,153,0.3)',
    },
    {
      label: 'Best Streak',
      value: `${bestStreak}d`,
      icon: '🔥',
      glow: 'rgba(251,146,60,0.3)',
    },
    {
      label: 'Weekly Avg',
      value: `${weeklyRate}%`,
      icon: '📈',
      glow: 'rgba(96,165,250,0.3)',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:bg-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-white/35 uppercase tracking-wide">
              {stat.label}
            </span>
            <span className="text-base leading-none">{stat.icon}</span>
          </div>
          <span className="text-xl font-bold text-white">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
