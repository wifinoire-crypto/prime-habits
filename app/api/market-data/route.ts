import { NextRequest, NextResponse } from 'next/server'
import { getMarketDataProvider } from '@/lib/market-data/provider'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'quote'
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json({ success: false, error: 'symbol required' }, { status: 400 })
  }

  const provider = getMarketDataProvider()

  try {
    if (action === 'quote') {
      const data = await provider.getQuote(symbol)
      return NextResponse.json({ success: true, data })
    }

    if (action === 'candles') {
      const days = parseInt(searchParams.get('days') ?? '90')
      const to = new Date()
      const from = new Date(Date.now() - days * 86400000)
      const data = await provider.getDailyCandles(symbol, from, to)
      return NextResponse.json({ success: true, data })
    }

    if (action === 'profile') {
      const data = await provider.getCompanyProfile(symbol)
      return NextResponse.json({ success: true, data })
    }

    if (action === 'earnings') {
      const data = await provider.getEarningsCalendar(symbol)
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: false, error: 'unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
