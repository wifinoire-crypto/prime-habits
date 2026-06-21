import { NextRequest, NextResponse } from 'next/server'
import { getMarketDataProvider } from '@/lib/market-data/provider'
import { getResearchProvider } from '@/lib/research/provider'
import { calculateIndicators } from '@/lib/indicators/service'
import { generateTickerResearch } from '@/lib/agents/ticker-research-agent'
import { db } from '@/lib/db'
import { logTool } from '@/lib/tools/audit-log'

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase()
  const { searchParams } = new URL(req.url)
  const includeReport = searchParams.get('report') === 'true'

  const marketProvider = getMarketDataProvider()
  const researchProvider = getResearchProvider()
  const runId = Math.random().toString(36).slice(2)
  const toolResults = []

  try {
    // Fetch all data in parallel
    const [quote, profile, earnings] = await Promise.all([
      marketProvider.getQuote(symbol),
      marketProvider.getCompanyProfile(symbol),
      marketProvider.getEarningsCalendar(symbol),
    ])

    toolResults.push(logTool(runId, 'market_data_fetch', `Full data: ${symbol}`, { success: true, outputSummary: `$${quote.price}` }))

    // Candles + indicators
    const to = new Date()
    const from = new Date(Date.now() - 250 * 86400000)
    const candles = await marketProvider.getDailyCandles(symbol, from, to)
    const indicators = candles.length >= 2 ? await calculateIndicators(symbol, candles) : null

    if (indicators) {
      toolResults.push(logTool(runId, 'indicator_calculate', `Indicators: ${symbol}`, { success: true, outputSummary: `RSI=${indicators.rsi14}` }))
    }

    // News
    const news = await researchProvider.getCompanyNews(symbol)
    toolResults.push(logTool(runId, 'news_fetch', `News: ${symbol}`, { success: true, outputSummary: `${news.length} items` }))

    let report: string | undefined
    if (includeReport && indicators) {
      report = await generateTickerResearch({ symbol, quote, profile, indicators, news, earnings })

      const savedReport = await db.saveReport({
        reportType: 'ticker-deep-dive',
        title: `${symbol} Research — ${new Date().toLocaleDateString()}`,
        content: report,
        symbols: [symbol],
        sources: news.map(n => ({ title: n.title, url: n.url, publisher: n.publisher, timestamp: n.timestamp, snippet: n.snippet, fetchedAt: n.fetchedAt })),
        indicators: indicators ? [indicators] : [],
        createdAt: new Date().toISOString(),
        agentRunId: runId,
      })
      toolResults.push(logTool(runId, 'report_write', `Ticker research: ${symbol}`, { success: true, outputSummary: savedReport.id }))
    }

    return NextResponse.json({
      success: true,
      data: { quote, profile, earnings, candles: candles.slice(-90), indicators, news, report, toolResults },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
