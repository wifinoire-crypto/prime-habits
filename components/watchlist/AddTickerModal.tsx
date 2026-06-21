'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface AddTickerModalProps {
  onClose: () => void
  onAdded: () => void
}

type AssetType = 'stock' | 'etf' | 'crypto' | 'index'

export default function AddTickerModal({ onClose, onAdded }: AddTickerModalProps) {
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('stock')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symbol.trim()) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.trim().toUpperCase(), name: name.trim() || undefined, assetType }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? 'Failed to add ticker'); return }
      onAdded()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Add to Watchlist</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Ticker Symbol *</label>
            <input
              ref={inputRef}
              type="text"
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL, TSLA, BTC-USD"
              className="input-field w-full px-3 py-2.5 text-sm font-mono uppercase"
              maxLength={12}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Apple Inc."
              className="input-field w-full px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Asset Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(['stock', 'etf', 'crypto', 'index'] as AssetType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAssetType(t)}
                  className="py-2 rounded-lg text-xs font-medium transition-all"
                  style={assetType === t
                    ? { background: 'rgba(61,126,255,0.2)', border: '1px solid rgba(61,126,255,0.5)', color: '#93b4ff' }
                    : { background: '#060d1f', border: '1px solid #162040', color: '#64748b' }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-market-red bg-market-red-dim border border-market-red-border rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Add Ticker</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
