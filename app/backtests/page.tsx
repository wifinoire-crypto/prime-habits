import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'

export default function BacktestsPage() {
  return (
    <PageLayout title="Backtests" subtitle="Strategy performance analysis and historical simulation">
      <div className="space-y-5">
        <Card>
          <EmptyState
            icon="◷"
            title="Backtesting Coming in MVP 3"
            description="Define a strategy in Strategy Builder first. Backtesting via vectorbt or Backtrader will be available in the next milestone."
            action={
              <Link href="/strategy-builder"
                className="inline-flex items-center px-4 py-2 btn-primary text-sm">
                Go to Strategy Builder
              </Link>
            }
          />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3">What Backtests Will Include</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Return', desc: 'Strategy vs benchmark' },
              { label: 'CAGR', desc: 'Annualized growth rate' },
              { label: 'Max Drawdown', desc: 'Worst peak-to-trough' },
              { label: 'Win Rate', desc: 'Profitable trade %' },
              { label: 'Sharpe Ratio', desc: 'Risk-adjusted return' },
              { label: 'Profit Factor', desc: 'Gross profit / gross loss' },
              { label: 'Equity Curve', desc: 'Portfolio value over time' },
              { label: 'Trade Log', desc: 'Every entry and exit' },
            ].map(({ label, desc }) => (
              <div key={label} className="p-3 rounded-lg" style={{ background: '#060d1f', border: '1px solid #162040' }}>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
