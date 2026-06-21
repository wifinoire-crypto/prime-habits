'use client'

import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const INDICATORS = ['price', 'rsi14', 'ema20', 'ema50', 'sma200', 'macd', 'atr14', 'volume']
const OPERATORS = ['>', '<', '>=', '<=', '==', 'crosses_above', 'crosses_below']

interface Rule {
  field: string
  operator: string
  value: string
}

export default function StrategyBuilderPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [universe, setUniverse] = useState('SPY,QQQ,AAPL,NVDA')
  const [timeframe, setTimeframe] = useState('1d')
  const [entryRules, setEntryRules] = useState<Rule[]>([{ field: 'rsi14', operator: '<', value: '30' }])
  const [exitRules, setExitRules] = useState<Rule[]>([{ field: 'rsi14', operator: '>', value: '70' }])
  const [stopLoss, setStopLoss] = useState('5')
  const [takeProfit, setTakeProfit] = useState('15')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const addRule = (type: 'entry' | 'exit') => {
    const rule = { field: 'rsi14', operator: '<', value: '50' }
    if (type === 'entry') setEntryRules(prev => [...prev, rule])
    else setExitRules(prev => [...prev, rule])
  }

  const updateRule = (type: 'entry' | 'exit', idx: number, key: keyof Rule, val: string) => {
    if (type === 'entry') {
      setEntryRules(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r))
    } else {
      setExitRules(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r))
    }
  }

  const removeRule = (type: 'entry' | 'exit', idx: number) => {
    if (type === 'entry') setEntryRules(prev => prev.filter((_, i) => i !== idx))
    else setExitRules(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (!name.trim()) { setSaveError('Strategy name is required'); return }
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, assetUniverse: universe, timeframe, entryRules, exitRules, stopLoss, takeProfit, positionSizing: 'fixed' }),
      }).then(r => r.json())
      if (!res.success) { setSaveError(res.error ?? 'Save failed'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout
      title="Strategy Builder"
      subtitle="Define systematic trading rules and entry/exit conditions"
      action={<Button onClick={handleSave} loading={saving}>{saved ? '✓ Saved!' : 'Save Strategy'}</Button>}>

      {saveError && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm text-market-red bg-market-red-dim border border-market-red-border">{saveError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <Card className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Strategy Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1.5">Strategy Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. RSI Mean Reversion" className="input-field w-full px-3 py-2.5 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your strategy hypothesis…" rows={2} className="input-field w-full px-3 py-2.5 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Asset Universe (comma-separated)</label>
                <input value={universe} onChange={e => setUniverse(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Timeframe</label>
                <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm">
                  {['1m', '5m', '15m', '1h', '4h', '1d', '1w'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Entry Rules */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entry Rules</h3>
              <Button size="sm" variant="secondary" onClick={() => addRule('entry')}>+ Add Rule</Button>
            </div>
            <div className="space-y-2">
              {entryRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={rule.field} onChange={e => updateRule('entry', i, 'field', e.target.value)} className="input-field flex-1 px-2 py-2 text-sm">
                    {INDICATORS.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                  <select value={rule.operator} onChange={e => updateRule('entry', i, 'operator', e.target.value)} className="input-field px-2 py-2 text-sm">
                    {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                  <input value={rule.value} onChange={e => updateRule('entry', i, 'value', e.target.value)} className="input-field w-24 px-2 py-2 text-sm font-mono" />
                  <button onClick={() => removeRule('entry', i)} className="text-slate-600 hover:text-market-red px-2">×</button>
                </div>
              ))}
            </div>
          </Card>

          {/* Exit Rules */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exit Rules</h3>
              <Button size="sm" variant="secondary" onClick={() => addRule('exit')}>+ Add Rule</Button>
            </div>
            <div className="space-y-2">
              {exitRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={rule.field} onChange={e => updateRule('exit', i, 'field', e.target.value)} className="input-field flex-1 px-2 py-2 text-sm">
                    {INDICATORS.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                  <select value={rule.operator} onChange={e => updateRule('exit', i, 'operator', e.target.value)} className="input-field px-2 py-2 text-sm">
                    {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                  <input value={rule.value} onChange={e => updateRule('exit', i, 'value', e.target.value)} className="input-field w-24 px-2 py-2 text-sm font-mono" />
                  <button onClick={() => removeRule('exit', i)} className="text-slate-600 hover:text-market-red px-2">×</button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Risk Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Stop Loss (%)</label>
                <input value={stopLoss} onChange={e => setStopLoss(e.target.value)} type="number" step="0.5" className="input-field w-full px-3 py-2.5 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Take Profit (%)</label>
                <input value={takeProfit} onChange={e => setTakeProfit(e.target.value)} type="number" step="0.5" className="input-field w-full px-3 py-2.5 text-sm font-mono" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-slate-500 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-400">Strategy Checklist</p>
              {[
                [!!name, 'Strategy name defined'],
                [universe.split(',').filter(Boolean).length > 0, 'Asset universe set'],
                [entryRules.length > 0, 'Entry rules defined'],
                [exitRules.length > 0, 'Exit rules defined'],
                [!!stopLoss, 'Stop loss set'],
              ].map(([ok, label], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={ok ? 'text-market-green' : 'text-slate-600'}>{ok ? '✓' : '○'}</span>
                  <span className={ok ? 'text-slate-300' : 'text-slate-600'}>{label as string}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="text-xs text-slate-600 p-3 rounded-lg" style={{ background: '#0a1428', border: '1px solid #162040' }}>
            ⚡ <strong className="text-slate-500">Coming in MVP 3:</strong> Backtest this strategy using vectorbt or Backtrader with historical data.
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
