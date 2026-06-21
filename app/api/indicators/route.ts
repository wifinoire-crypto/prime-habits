import { NextRequest, NextResponse } from 'next/server'
import { getMarketDataProvider } from '@/lib/market-data/provider'
import { calculateIndicators } from '@/lib/indicators/service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const days = parseInt(searchParams.get('days') ?? '250')

  if (!symbol) {
    return NextResponse.json({ success: false, error: 'symbol required' }, { status: 400 })
  }

  try {
    const provider = getMarketDataProvider()
    const to = new Date()
    const from = new Date(Date.now() - days * 86400000)
    const candles = await provider.getDailyCandles(symbol, from, to)

    if (candles.length < 2) {
      return NextResponse.json({ success: false, error: 'Not enough candle data' }, { status: 422 })
    }

    const indicators = await calculateIndicators(symbol, candles)
    return NextResponse.json({ success: true, data: indicators })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
