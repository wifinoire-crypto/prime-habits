import { IndicatorResult } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface IndicatorGridProps {
  indicators: IndicatorResult
}

function IndicatorCell({ label, value, signal }: { label: string; value: string; signal?: 'green' | 'red' | 'yellow' | 'muted' }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: '#060d1f', border: '1px solid #162040' }}>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="font-mono text-sm font-bold text-white">{value}</div>
      {signal && (
        <div className="mt-1.5">
          {signal === 'green' && <span className="text-[10px] text-market-green">▲ Bullish</span>}
          {signal === 'red' && <span className="text-[10px] text-market-red">▼ Bearish</span>}
          {signal === 'yellow' && <span className="text-[10px] text-market-yellow">~ Neutral</span>}
        </div>
      )}
    </div>
  )
}

function rsiSignal(rsi: number | null): 'green' | 'red' | 'yellow' | 'muted' {
  if (rsi === null) return 'muted'
  if (rsi > 70) return 'red'
  if (rsi < 30) return 'green'
  return 'yellow'
}

export default function IndicatorGrid({ indicators: ind }: IndicatorGridProps) {
  const trendSignal: 'green' | 'red' | 'muted' = ind.ema20 && ind.ema50
    ? ind.ema20 > ind.ema50 ? 'green' : 'red'
    : 'muted'

  const macdSignal: 'green' | 'red' | 'muted' = ind.macd
    ? ind.macd.histogram > 0 ? 'green' : 'red'
    : 'muted'

  const smaSignal: 'green' | 'red' | 'muted' = ind.sma200
    ? ind.price > ind.sma200 ? 'green' : 'red'
    : 'muted'

  return (
    <Card className="p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Technical Indicators</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <IndicatorCell
          label="RSI (14)"
          value={ind.rsi14 !== null ? ind.rsi14.toFixed(1) : 'N/A'}
          signal={rsiSignal(ind.rsi14)}
        />
        <IndicatorCell
          label="EMA (20)"
          value={ind.ema20 !== null ? `$${ind.ema20.toFixed(2)}` : 'N/A'}
          signal={ind.ema20 ? (ind.price > ind.ema20 ? 'green' : 'red') : 'muted'}
        />
        <IndicatorCell
          label="EMA (50)"
          value={ind.ema50 !== null ? `$${ind.ema50.toFixed(2)}` : 'N/A'}
          signal={trendSignal}
        />
        <IndicatorCell
          label="SMA (200)"
          value={ind.sma200 !== null ? `$${ind.sma200.toFixed(2)}` : 'N/A'}
          signal={smaSignal}
        />
        <IndicatorCell
          label="MACD"
          value={ind.macd ? ind.macd.macd.toFixed(4) : 'N/A'}
          signal={macdSignal}
        />
        <IndicatorCell
          label="MACD Signal"
          value={ind.macd ? ind.macd.signal.toFixed(4) : 'N/A'}
        />
        <IndicatorCell
          label="MACD Hist"
          value={ind.macd ? ind.macd.histogram.toFixed(4) : 'N/A'}
          signal={macdSignal}
        />
        <IndicatorCell
          label="ATR (14)"
          value={ind.atr14 !== null ? `$${ind.atr14.toFixed(2)}` : 'N/A'}
        />
        <IndicatorCell
          label="BB Upper"
          value={ind.bollingerBands ? `$${ind.bollingerBands.upper.toFixed(2)}` : 'N/A'}
        />
        <IndicatorCell
          label="BB Lower"
          value={ind.bollingerBands ? `$${ind.bollingerBands.lower.toFixed(2)}` : 'N/A'}
        />
        <IndicatorCell
          label="BB Width"
          value={ind.bollingerBands ? `${ind.bollingerBands.bandwidth.toFixed(1)}%` : 'N/A'}
        />
        <IndicatorCell
          label="Rel. Volume"
          value={ind.relativeVolume !== null ? `${ind.relativeVolume.toFixed(2)}x` : 'N/A'}
          signal={ind.relativeVolume ? (ind.relativeVolume > 1.5 ? 'yellow' : 'muted') : 'muted'}
        />
      </div>

      {/* 52-week range */}
      {ind.weekHigh52 && ind.weekLow52 && (
        <div className="mt-4 p-3 rounded-lg" style={{ background: '#060d1f', border: '1px solid #162040' }}>
          <div className="text-xs text-slate-500 mb-2">52-Week Range</div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-market-red">${ind.weekLow52.toFixed(2)}</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: '#162040' }}>
              {ind.weekHigh52 > ind.weekLow52 && (
                <div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #ef4444, #22c55e)',
                    width: `${((ind.price - ind.weekLow52) / (ind.weekHigh52 - ind.weekLow52)) * 100}%`,
                    maxWidth: '100%',
                  }}
                />
              )}
            </div>
            <span className="text-xs font-mono text-market-green">${ind.weekHigh52.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-600">{ind.distanceFrom52wLow?.toFixed(1)}% from low</span>
            <span className="text-[10px] text-slate-600">{ind.distanceFrom52wHigh?.toFixed(1)}% from high</span>
          </div>
        </div>
      )}
    </Card>
  )
}
