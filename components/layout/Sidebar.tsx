'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV = [
  { href: '/', label: 'Dashboard', icon: '⬡' },
  { href: '/morning-brief', label: 'Morning Brief', icon: '☀' },
  { href: '/watchlist', label: 'Watchlist', icon: '◈' },
  { href: '/reports', label: 'Reports', icon: '⊟' },
  { href: '/strategy-builder', label: 'Strategy Builder', icon: '⊕' },
  { href: '/backtests', label: 'Backtests', icon: '◷' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-56 flex flex-col z-20"
      style={{ background: '#060d1f', borderRight: '1px solid #162040' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-terminal-border">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: 'rgba(61,126,255,0.2)', border: '1px solid rgba(61,126,255,0.4)', color: '#3d7eff' }}>
          T
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-none">TradingAgent</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Intelligence Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-widest text-slate-600 px-2 mb-3 font-semibold">Navigation</div>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-150',
                active
                  ? 'text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
              style={active ? { background: 'rgba(61,126,255,0.15)', border: '1px solid rgba(61,126,255,0.25)', color: '#93b4ff' } : {}}>
              <span className="text-base w-5 text-center" style={{ fontStyle: 'normal' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-terminal-border">
        <div className="text-[10px] text-slate-600 leading-relaxed">
          ⚠ Research tool only.<br />Not financial advice.
        </div>
      </div>
    </aside>
  )
}
