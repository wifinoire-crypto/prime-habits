import Sidebar from './Sidebar'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageLayout({ children, title, subtitle, action }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: '#060d1f' }}>
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        <header className="sticky top-0 z-10 px-8 py-5 flex items-center justify-between"
          style={{ background: 'rgba(6,13,31,0.95)', borderBottom: '1px solid #162040', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
