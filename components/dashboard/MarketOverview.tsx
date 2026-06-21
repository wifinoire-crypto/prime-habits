'use client'

import { useEffect, useState } from 'react'
import { Quote } from '@/lib/types'
import Card from '@/components/ui/Card'
import { ChangeBadge } from '@/components/ui/Badge'

const INDICES = ['SPY', 'QQQ', 'IWM', 'DIA']

export default function MarketOverview() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all(
      INDICES.map(sym => fetch(`/api/market-data?action=quote&symbol=${sym}`).then(r => r.json()))
    ).then(results => {
      setQuotes(results.filter((r: { success: boolean }) => r.success).map((r: { data: Quote }) => r.data))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const labels: Record<string, string> = { SPY: 'S&P 500', QQQ: 'Nasdaq 100', IWM: 'Russell 2000', DIA: 'Dow Jones' }

  return (
    <Card className="p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Market Overview</h2>
      {loading ? (
        <div className="grid grid-cols-4 gap-3">
          {INDICES.map(s => (
            <div key={s} className="shimmer-bg rounded-lg h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quotes.map(q => (
            <div key={q.symbol} className="rounded-lg p-3" style={{ background: '#060d1f', border: '1px solid #162040' }}>
              <div className="text-xs text-slate-500 mb-1">{labels[q.symbol] ?? q.symbol}</div>
              <div className="text-lg font-bold text-white font-mono">${q.price.toFixed(2)}</div>
              <div className="mt-1"><ChangeBadge value={q.changePercent} /></div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
