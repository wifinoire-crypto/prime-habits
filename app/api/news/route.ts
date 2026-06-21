import { NextRequest, NextResponse } from 'next/server'
import { getResearchProvider } from '@/lib/research/provider'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const query = searchParams.get('q')

  const provider = getResearchProvider()

  try {
    if (symbol) {
      const data = await provider.getCompanyNews(symbol)
      return NextResponse.json({ success: true, data })
    }
    if (query) {
      const data = await provider.search(query)
      return NextResponse.json({ success: true, data })
    }
    const data = await provider.getMarketNews()
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
