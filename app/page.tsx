import PageLayout from '@/components/layout/PageLayout'
import MarketOverview from '@/components/dashboard/MarketOverview'
import WatchlistSummary from '@/components/dashboard/WatchlistSummary'
import RecentReports from '@/components/dashboard/RecentReports'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <PageLayout title="Dashboard" subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}>
      {/* Quick actions */}
      <div className="flex gap-3 mb-6">
        <Link href="/morning-brief"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'rgba(61,126,255,0.15)', border: '1px solid rgba(61,126,255,0.3)', color: '#93b4ff' }}>
          ☀ Morning Brief
        </Link>
        <Link href="/watchlist"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #162040', color: '#94a3b8' }}>
          ◈ Watchlist
        </Link>
        <Link href="/reports"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #162040', color: '#94a3b8' }}>
          ⊟ Reports
        </Link>
      </div>

      <div className="space-y-5">
        <MarketOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <WatchlistSummary />
          <RecentReports />
        </div>

        {/* Info banner */}
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(61,126,255,0.06)', border: '1px solid rgba(61,126,255,0.15)' }}>
          <div className="flex gap-3">
            <span className="text-market-blue shrink-0 mt-0.5">ℹ</span>
            <div className="text-slate-400">
              <strong className="text-slate-300">Getting started:</strong> Configure API keys in <code className="text-market-blue">.env.local</code> for live data (Finnhub, Perplexity, Anthropic).
              Without keys, the platform runs on realistic mock data so you can explore all features immediately.
              {' '}<Link href="/settings" className="text-market-blue hover:underline">View settings →</Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
