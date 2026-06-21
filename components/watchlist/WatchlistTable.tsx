'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WatchedAsset, Quote } from '@/lib/types'
import { ChangeBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

interface WatchlistTableProps {
  onAdd: () => void
  refreshKey: number
}

export default function WatchlistTable({ onAdd, refreshKey }: WatchlistTableProps) {
  const [assets, setAssets] = useState<WatchedAsset[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/watchlist').then(r => r.json())
    if (!res.success) { setLoading(false); return }
    const assetList: WatchedAsset[] = res.data.assets
    setAssets(assetList)

    // Fetch quotes in parallel
    const quoteMap: Record<string, Quote> = {}
    await Promise.all(
      assetList.map(a =>
        fetch(`/api/market-data?action=quote&symbol=${a.symbol}`)
          .then(r => r.json())
          .then(d => { if (d.success) quoteMap[a.symbol] = d.data })
          .catch(() => {})
      )
    )
    setQuotes(quoteMap)
    setLoading(false)
  }

  useEffect(() => { load() }, [refreshKey])

  const remove = async (id: string) => {
    setRemoving(id)
    await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' })
    setAssets(prev => prev.filter(a => a.id !== id))
    setRemoving(null)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="shimmer-bg h-14 rounded-lg" />)}
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <EmptyState
        icon="◈"
        title="Your watchlist is empty"
        description="Add tickers to track their prices, news, and research."
        action={<Button onClick={onAdd}>+ Add Ticker</Button>}
      />
    )
  }

  const gainers = assets.filter(a => (quotes[a.symbol]?.changePercent ?? 0) > 0).length
  const losers = assets.filter(a => (quotes[a.symbol]?.changePercent ?? 0) < 0).length

  return (
    <div>
      {/* Summary bar */}
      <div className="flex gap-6 mb-4 text-sm text-slate-500">
        <span>{assets.length} tickers</span>
        <span className="text-market-green">▲ {gainers} up</span>
        <span className="text-market-red">▼ {losers} down</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #162040' }}>
              {['Symbol', 'Price', 'Change', 'High', 'Low', 'Volume', 'Type', ''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => {
              const q = quotes[asset.symbol]
              return (
                <tr key={asset.id} className="border-b border-terminal-border last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/ticker/${asset.symbol}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-market-blue"
                        style={{ background: 'rgba(61,126,255,0.1)', border: '1px solid rgba(61,126,255,0.2)' }}>
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-market-blue transition-colors">{asset.symbol}</div>
                        <div className="text-xs text-slate-500">{asset.name ?? '—'}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-bold text-white">
                    {q ? `$${q.price.toFixed(2)}` : <div className="w-16 h-4 shimmer-bg rounded" />}
                  </td>
                  <td className="px-4 py-3">
                    {q ? <ChangeBadge value={q.changePercent} /> : <div className="w-14 h-4 shimmer-bg rounded" />}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {q ? `$${q.high.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {q ? `$${q.low.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {q ? `${(q.volume / 1e6).toFixed(1)}M` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 capitalize">{asset.assetType}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(asset.id)}
                      disabled={removing === asset.id}
                      className="text-xs text-slate-600 hover:text-market-red transition-colors px-2 py-1 rounded hover:bg-market-red-dim">
                      {removing === asset.id ? '…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
