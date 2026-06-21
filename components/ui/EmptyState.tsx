interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon = '◈', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-4xl opacity-20">{icon}</div>
      <div>
        <h3 className="text-base font-semibold text-slate-300">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
