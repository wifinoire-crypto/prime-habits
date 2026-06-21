export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size]
  return (
    <svg className={`animate-spin ${s} text-market-blue`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}
