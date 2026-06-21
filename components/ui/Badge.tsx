import clsx from 'clsx'

type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export default function Badge({ children, variant = 'muted', className }: BadgeProps) {
  return (
    <span className={clsx(`badge-${variant}`, 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', className)}>
      {children}
    </span>
  )
}

export function ChangeBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const positive = value > 0
  const zero = value === 0
  return (
    <Badge variant={zero ? 'muted' : positive ? 'green' : 'red'}>
      {positive ? '+' : ''}{value.toFixed(2)}{suffix}
    </Badge>
  )
}
