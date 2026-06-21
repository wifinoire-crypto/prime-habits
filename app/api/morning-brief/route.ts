import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/local-store'
import { getMarketDataProvider } from '@/lib/market-data/provider'
import { getResearchProvider } from '@/lib/research/provider'
import { calculateIndicators } from '@/lib/indicators/service'
import { generateMorningBrief } from '@/lib/agents/morning-brief-agent'
import { logTool } from '@/lib/tools/audit-log'
import { format } from 'date-fns'
import { Quote, NewsItem, IndicatorResult } from '@/lib/types'

export async function GET() {
  const reports = db.getReports().filter(r => r.reportType === 'morning-brief')
  return NextResponse.json({ success: true, data: reports })
}

export async function POST() {
  const runId = Math.random().toString(36).slice(2)
  const today = format(new Date(), 'MMMM d, yyyy')
  const toolResults = []

  try {
    // 1. Load watchlist
    const symbols = db.getWatchedSymbols('default')
    if (symbols.length === 0) {
      return NextResponse.json({ success: false, error: 'Watchlist is empty. Add some tickers first.' }, { status: 422 })
    }

    const marketProvider = getMarketDataProvider()
    const researchProvider = getResearchProvider()

    // 2. Fetch quotes for all symbols
    const quotes: Quote[] = []
    for (const symbol of symbols) {
      try {
        const q = await marketProvider.getQuote(symbol)
        quotes.push(q)
        toolResults.push(logTool(runId, 'market_data_fetch', `Quote: ${symbol}`, {
          success: true,
          outputSummary: `$${q.price} (${q.changePercent > 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`,
        }))
      } catch (err) {
        toolResults.push(logTool(runId, 'market_data_fetch', `Quote: ${symbol}`, { success: false, error: String(err) }))
      }
    }

    // 3. Fetch market news
    let marketNews: NewsItem[] = []
    try {
      marketNews = await researchProvider.getMarketNews()
      toolResults.push(logTool(runId, 'news_fetch', 'Market news', { success: true, outputSummary: `${marketNews.length} items`, sourceUrls: marketNews.map(n => n.url).filter(Boolean) }))
    } catch (err) {
      toolResults.push(logTool(runId, 'news_fetch', 'Market news', { success: false, error: String(err) }))
    }

    // 4. Fetch ticker news for each symbol
    const allNews: NewsItem[] = []
    for (const symbol of symbols.slice(0, 5)) {  // limit to avoid rate limits
      try {
        const news = await researchProvider.getCompanyNews(symbol)
        allNews.push(...news)
        toolResults.push(logTool(runId, 'news_fetch', `News: ${symbol}`, { success: true, outputSummary: `${news.length} items` }))
      } catch (err) {
        toolResults.push(logTool(runId, 'news_fetch', `News: ${symbol}`, { success: false, error: String(err) }))
      }
    }

    // 5. Calculate indicators for each symbol
    const indicators: IndicatorResult[] = []
    for (const symbol of symbols) {
      try {
        const to = new Date()
        const from = new Date(Date.now() - 250 * 86400000)
        const candles = await marketProvider.getDailyCandles(symbol, from, to)
        if (candles.length >= 2) {
          const ind = await calculateIndicators(symbol, candles)
          indicators.push(ind)
          toolResults.push(logTool(runId, 'indicator_calculate', `Indicators: ${symbol}`, {
            success: true,
            outputSummary: `RSI=${ind.rsi14 ?? 'N/A'}, Price=$${ind.price}`,
          }))
        }
      } catch (err) {
        toolResults.push(logTool(runId, 'indicator_calculate', `Indicators: ${symbol}`, { success: false, error: String(err) }))
      }
    }

    // 6. Generate AI brief
    const briefContent = await generateMorningBrief({
      date: today,
      watchlistSymbols: symbols,
      quotes,
      news: allNews,
      indicators,
      marketNews,
    })

    // 7. Save report
    const report = db.saveReport({
      reportType: 'morning-brief',
      title: `Morning Brief — ${today}`,
      content: briefContent,
      symbols,
      sources: [...marketNews, ...allNews].map(n => ({ title: n.title, url: n.url, publisher: n.publisher, timestamp: n.timestamp, snippet: n.snippet, fetchedAt: n.fetchedAt })),
      indicators,
      createdAt: new Date().toISOString(),
      agentRunId: runId,
    })

    toolResults.push(logTool(runId, 'report_write', `Morning Brief ${today}`, { success: true, outputSummary: report.id }))

    return NextResponse.json({ success: true, data: { report, toolResults } })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
