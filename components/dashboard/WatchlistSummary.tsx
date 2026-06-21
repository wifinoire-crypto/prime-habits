'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WatchedAsset, Quote } from '@/lib/types'
import Card from '@/components/ui/Card'
import { ChangeBadge } from '@/components/ui/Badge'
import { LoadingScreen } from '@/components/ui/Spinner'

export default function WatchlistSummary() {
  const [assets, setAssets] = useState<WatchedAsset[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/watchlist').then(r => r.json()).then(async data => {
      if (!data.success) return
      const assetList: WatchedAsset[] = data.data.assets
      setAssets(assetList)
      const quoteMap: Record<string, Quote> = {}
      await Promise.all(
        assetList.map(a =>
          fetch(`/api/market-data?action=quote&symbol=${a.symbol}`)
            .then(r => r.json())
            .then(d => { if (d.success) quoteMap[a.symbol] = d.data })
        )
      )
      setQuotes(quoteMap)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Card className="p-5"><LoadingScreen message="Loading watchlist…" /></Card>

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Watchlist</h2>
        <Link href="/watchlist" className="text-xs text-market-blue hover:underline">Manage →</Link>
      </div>
      {assets.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">No assets in watchlist. <Link href="/watchlist" className="text-market-blue hover:underline">Add tickers →</Link></p>
      ) : (
        <div className="space-y-1">
          {assets.map(asset => {
            const q = quotes[asset.symbol]
            return (
              <Link key={asset.id} href={`/ticker/${asset.symbol}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-market-blue"
                    style={{ background: 'rgba(61,126,255,0.1)', border: '1px solid rgba(61,126,255,0.2)' }}>
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{asset.symbol}</div>
                    <div className="text-xs text-slate-500">{asset.name ?? asset.assetType}</div>
                  </div>
                </div>
                {q ? (
                  <div className="text-right">
                    <div className="text-sm font-bold text-white font-mono">${q.price.toFixed(2)}</div>
                    <ChangeBadge value={q.changePercent} />
                  </div>
                ) : (
                  <div className="w-16 h-6 shimmer-bg rounded" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}
