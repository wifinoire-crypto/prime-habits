import { Candle, IndicatorResult } from '@/lib/types'

// Lazy-load technicalindicators to avoid SSR issues
async function getTI() {
  return await import('technicalindicators')
}

function last<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[arr.length - 1]! : null
}

export async function calculateIndicators(symbol: string, candles: Candle[]): Promise<IndicatorResult> {
  if (candles.length < 2) {
    throw new Error(`Need at least 2 candles, got ${candles.length}`)
  }

  const TI = await getTI()

  const closes = candles.map(c => c.close)
  const highs = candles.map(c => c.high)
  const lows = candles.map(c => c.low)
  const volumes = candles.map(c => c.volume)
  const price = closes[closes.length - 1]!
  const ts = candles[candles.length - 1]!.timestamp

  // RSI 14
  let rsi14: number | null = null
  if (closes.length >= 15) {
    const vals = TI.RSI.calculate({ values: closes, period: 14 })
    rsi14 = last(vals) ?? null
  }

  // MACD
  let macdResult: IndicatorResult['macd'] = null
  if (closes.length >= 35) {
    const vals = TI.MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false })
    const m = last(vals)
    if (m) macdResult = { macd: m.MACD ?? 0, signal: m.signal ?? 0, histogram: m.histogram ?? 0 }
  }

  // EMAs
  let ema20: number | null = null
  let ema50: number | null = null
  if (closes.length >= 21) {
    const vals = TI.EMA.calculate({ values: closes, period: 20 })
    ema20 = last(vals) ?? null
  }
  if (closes.length >= 51) {
    const vals = TI.EMA.calculate({ values: closes, period: 50 })
    ema50 = last(vals) ?? null
  }

  // SMA 200
  let sma200: number | null = null
  if (closes.length >= 200) {
    const vals = TI.SMA.calculate({ values: closes, period: 200 })
    sma200 = last(vals) ?? null
  }

  // Bollinger Bands
  let bollingerBands: IndicatorResult['bollingerBands'] = null
  if (closes.length >= 21) {
    const vals = TI.BollingerBands.calculate({ values: closes, period: 20, stdDev: 2 })
    const bb = last(vals)
    if (bb) {
      const bandwidth = bb.middle > 0 ? ((bb.upper - bb.lower) / bb.middle) * 100 : 0
      bollingerBands = { upper: bb.upper, middle: bb.middle, lower: bb.lower, bandwidth }
    }
  }

  // ATR 14
  let atr14: number | null = null
  if (candles.length >= 15) {
    const vals = TI.ATR.calculate({ high: highs, low: lows, close: closes, period: 14 })
    atr14 = last(vals) ?? null
  }

  // 52-week high/low (last 252 trading days)
  const window252 = candles.slice(-252)
  const weekHigh52 = window252.length > 0 ? Math.max(...window252.map(c => c.high)) : null
  const weekLow52 = window252.length > 0 ? Math.min(...window252.map(c => c.low)) : null
  const distanceFrom52wHigh = weekHigh52 ? ((price - weekHigh52) / weekHigh52) * 100 : null
  const distanceFrom52wLow = weekLow52 ? ((price - weekLow52) / weekLow52) * 100 : null

  // Volume analysis
  const recentVol = volumes[volumes.length - 1] ?? 0
  const prevVol = volumes[volumes.length - 2] ?? 0
  const volumeChange = prevVol > 0 ? ((recentVol - prevVol) / prevVol) * 100 : null
  const avgVolWindow = Math.min(20, volumes.length - 1)
  const avgVolume20 = avgVolWindow > 0
    ? volumes.slice(-avgVolWindow - 1, -1).reduce((a, b) => a + b, 0) / avgVolWindow
    : null
  const relativeVolume = avgVolume20 && avgVolume20 > 0 ? recentVol / avgVolume20 : null

  return {
    symbol,
    timestamp: ts,
    price: +(price.toFixed(2)),
    rsi14: rsi14 !== null ? +rsi14.toFixed(2) : null,
    macd: macdResult
      ? { macd: +macdResult.macd.toFixed(4), signal: +macdResult.signal.toFixed(4), histogram: +macdResult.histogram.toFixed(4) }
      : null,
    ema20: ema20 !== null ? +ema20.toFixed(2) : null,
    ema50: ema50 !== null ? +ema50.toFixed(2) : null,
    sma200: sma200 !== null ? +sma200.toFixed(2) : null,
    bollingerBands: bollingerBands
      ? { upper: +bollingerBands.upper.toFixed(2), middle: +bollingerBands.middle.toFixed(2), lower: +bollingerBands.lower.toFixed(2), bandwidth: +bollingerBands.bandwidth.toFixed(2) }
      : null,
    atr14: atr14 !== null ? +atr14.toFixed(2) : null,
    weekHigh52: weekHigh52 !== null ? +weekHigh52.toFixed(2) : null,
    weekLow52: weekLow52 !== null ? +weekLow52.toFixed(2) : null,
    distanceFrom52wHigh: distanceFrom52wHigh !== null ? +distanceFrom52wHigh.toFixed(2) : null,
    distanceFrom52wLow: distanceFrom52wLow !== null ? +distanceFrom52wLow.toFixed(2) : null,
    volumeChange: volumeChange !== null ? +volumeChange.toFixed(2) : null,
    avgVolume20: avgVolume20 !== null ? Math.round(avgVolume20) : null,
    relativeVolume: relativeVolume !== null ? +relativeVolume.toFixed(2) : null,
  }
}
