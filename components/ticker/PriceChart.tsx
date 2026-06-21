'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Candle } from '@/lib/types'
import { format } from 'date-fns'

interface PriceChartProps {
  candles: Candle[]
  symbol: string
}

const PERIODS = [
  { label: '1M', days: 21 },
  { label: '3M', days: 63 },
  { label: '6M', days: 126 },
  { label: '1Y', days: 252 },
]

interface TooltipPayload {
  value: number
  payload: { open: number; close: number; high: number; low: number; volume: number }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  const d = payload[0]!
  const isUp = d.payload.close >= d.payload.open
  return (
    <div className="card p-3 text-xs shadow-xl min-w-[140px]">
      <div className="text-slate-500 mb-2">{label}</div>
      <div className={`text-base font-bold font-mono mb-1 ${isUp ? 'text-market-green' : 'text-market-red'}`}>
        ${d.value.toFixed(2)}
      </div>
      <div className="space-y-1 text-slate-500">
        <div className="flex justify-between gap-4"><span>Open</span><span className="text-slate-300">${d.payload.open.toFixed(2)}</span></div>
        <div className="flex justify-between gap-4"><span>High</span><span className="text-slate-300">${d.payload.high.toFixed(2)}</span></div>
        <div className="flex justify-between gap-4"><span>Low</span><span className="text-slate-300">${d.payload.low.toFixed(2)}</span></div>
        <div className="flex justify-between gap-4"><span>Vol</span><span className="text-slate-300">{(d.payload.volume / 1e6).toFixed(1)}M</span></div>
      </div>
    </div>
  )
}

export default function PriceChart({ candles, symbol }: PriceChartProps) {
  const [period, setPeriod] = useState(PERIODS[1]!)

  const sliced = candles.slice(-period.days)
  const data = sliced.map(c => ({
    date: format(new Date(c.timestamp), 'MMM d'),
    close: c.close,
    open: c.open,
    high: c.high,
    low: c.low,
    volume: c.volume,
  }))

  if (data.length === 0) return null

  const firstClose = data[0]!.close
  const lastClose = data[data.length - 1]!.close
  const isUp = lastClose >= firstClose
  const pct = ((lastClose - firstClose) / firstClose) * 100
  const lineColor = isUp ? '#00e676' : '#ff4444'
  const minClose = Math.min(...data.map(d => d.low ?? d.close))
  const maxClose = Math.max(...data.map(d => d.high ?? d.close))
  const padding = (maxClose - minClose) * 0.05
  const domain: [number, number] = [minClose - padding, maxClose + padding]

  // Show every Nth label to avoid crowding
  const step = Math.max(1, Math.floor(data.length / 6))
  const tickFormatter = (_: string, index: number) => index % step === 0 ? data[index]?.date ?? '' : ''

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-semibold text-white">{symbol} Price</span>
          <span className={`ml-3 text-sm font-mono font-bold ${isUp ? 'text-market-green' : 'text-market-red'}`}>
            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
          </span>
          <span className="text-xs text-slate-500 ml-2">({period.label})</span>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button key={p.label} onClick={() => setPeriod(p)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all"
              style={period.label === p.label
                ? { background: 'rgba(61,126,255,0.2)', color: '#93b4ff', border: '1px solid rgba(61,126,255,0.4)' }
                : { background: 'transparent', color: '#64748b', border: '1px solid transparent' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#162040" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={tickFormatter}
          />
          <YAxis
            domain={domain}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v.toFixed(0)}`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e3060', strokeWidth: 1 }} />
          <ReferenceLine y={firstClose} stroke="#334155" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="close"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
