import { NewsItem, SearchResult } from '@/lib/types'
import { ResearchProvider } from './provider'

function uid() { return Math.random().toString(36).slice(2) }

const MOCK_NEWS: Record<string, Omit<NewsItem, 'id' | 'fetchedAt' | 'symbol'>[]> = {
  SPY: [
    { title: 'S&P 500 Climbs on Strong Jobs Data, Tech Leads Gains', url: 'https://example.com/spy-1', publisher: 'Reuters', timestamp: Date.now() - 2 * 3600000, snippet: 'The S&P 500 rose 0.8% on Friday after a stronger-than-expected jobs report eased recession fears. Technology and financial sectors led the broad advance.', sentiment: 'positive' },
    { title: 'Fed Minutes Reveal Officials See One More Rate Cut in 2025', url: 'https://example.com/spy-2', publisher: 'Bloomberg', timestamp: Date.now() - 5 * 3600000, snippet: 'Federal Reserve officials are generally aligned on one additional rate cut this year, according to minutes released Wednesday, though several wanted to see more progress on inflation.', sentiment: 'neutral' },
  ],
  QQQ: [
    { title: 'Nasdaq 100 Powers Higher as AI Enthusiasm Lifts Megacaps', url: 'https://example.com/qqq-1', publisher: 'CNBC', timestamp: Date.now() - 1.5 * 3600000, snippet: 'The Nasdaq 100 gained 1.2% Monday, propelled by continued enthusiasm around artificial intelligence spending and strong earnings outlooks from major index constituents.', sentiment: 'positive' },
  ],
  AAPL: [
    { title: 'Apple Intelligence Adoption Accelerates Ahead of WWDC', url: 'https://example.com/aapl-1', publisher: 'MacRumors', timestamp: Date.now() - 3 * 3600000, snippet: 'Apple\'s on-device AI features have driven significant iPhone upgrade cycles, with analysts upgrading estimates ahead of WWDC announcements expected next month.', sentiment: 'positive' },
    { title: 'Apple Beats Q2 Estimates; Services Revenue Hits Record $24.2B', url: 'https://example.com/aapl-2', publisher: 'Wall Street Journal', timestamp: Date.now() - 26 * 3600000, snippet: 'Apple reported EPS of $2.40 vs $2.28 estimate on revenue of $95.4B. Services segment grew 12% YoY to a new record, offsetting flat iPhone sales.', sentiment: 'positive' },
    { title: 'Analysts Debate Apple Vision Pro Long-Term Trajectory', url: 'https://example.com/aapl-3', publisher: 'Barron\'s', timestamp: Date.now() - 48 * 3600000, snippet: 'Mixed analyst views on Vision Pro adoption curve as Apple reportedly works on a lower-cost version. Some see spatial computing as a long-term catalyst.', sentiment: 'neutral' },
  ],
  NVDA: [
    { title: 'NVIDIA Blackwell Demand Exceeds Production Capacity, CEO Says', url: 'https://example.com/nvda-1', publisher: 'The Verge', timestamp: Date.now() - 1 * 3600000, snippet: 'NVIDIA CEO Jensen Huang reiterated that demand for Blackwell GPUs significantly exceeds current manufacturing capacity, with hyperscalers competing for allocation.', sentiment: 'positive' },
    { title: 'NVIDIA Reports Record Data Center Revenue of $47.5B', url: 'https://example.com/nvda-2', publisher: 'Bloomberg', timestamp: Date.now() - 22 * 3600000, snippet: 'NVIDIA posted record quarterly earnings with data center revenue surging 427% YoY to $47.5B. Guidance for Q3 exceeded highest analyst estimates.', sentiment: 'positive' },
  ],
  TSLA: [
    { title: 'Tesla Robotaxi Launch Timeline Pushed to Q4 2025', url: 'https://example.com/tsla-1', publisher: 'Electrek', timestamp: Date.now() - 4 * 3600000, snippet: 'Tesla has adjusted its robotaxi commercial launch timeline to Q4 2025, according to internal communications. The company cites regulatory approval processes in key markets.', sentiment: 'negative' },
    { title: 'Tesla Q1 Deliveries Miss: 336K vs 390K Estimate', url: 'https://example.com/tsla-2', publisher: 'Reuters', timestamp: Date.now() - 72 * 3600000, snippet: 'Tesla delivered 336,681 vehicles in Q1 2025, significantly below the 390,000 analyst consensus. The company cited production transition costs and weaker European demand.', sentiment: 'negative' },
    { title: 'Musk Affirms Tesla AI Day Coming This Summer With FSD Updates', url: 'https://example.com/tsla-3', publisher: 'TechCrunch', timestamp: Date.now() - 8 * 3600000, snippet: 'Elon Musk confirmed an upcoming Tesla AI Day event where the company will showcase Full Self-Driving v13 and share Dojo supercomputer progress.', sentiment: 'positive' },
  ],
}

const MARKET_NEWS: Omit<NewsItem, 'id' | 'fetchedAt'>[] = [
  { symbol: undefined, title: 'Markets Open Mixed as Investors Weigh PCE Inflation Data', url: 'https://example.com/m1', publisher: 'Reuters', timestamp: Date.now() - 1 * 3600000, snippet: 'US equity markets opened with mixed signals Friday. The S&P 500 edged up 0.2% while the Nasdaq slipped 0.1% as investors digested cooler-than-expected PCE inflation data.', sentiment: 'neutral' },
  { symbol: undefined, title: 'Treasury Yields Rise as Fed Taper Talk Returns', url: 'https://example.com/m2', publisher: 'Bloomberg', timestamp: Date.now() - 3 * 3600000, snippet: 'The 10-year Treasury yield climbed to 4.52% as several Federal Reserve officials suggested the case for pausing rate cuts has strengthened given recent inflation data.', sentiment: 'negative' },
  { symbol: undefined, title: 'VIX Drops Below 15 as Options Market Signals Complacency', url: 'https://example.com/m3', publisher: 'MarketWatch', timestamp: Date.now() - 5 * 3600000, snippet: 'The CBOE Volatility Index fell below 15 for the first time in six months, reflecting market calm ahead of a quiet earnings week and expected low macro data flow.', sentiment: 'positive' },
  { symbol: undefined, title: 'Goldman Upgrades US Equities Outlook, Sees 5% More Upside', url: 'https://example.com/m4', publisher: 'Financial Times', timestamp: Date.now() - 8 * 3600000, snippet: 'Goldman Sachs raised its S&P 500 year-end target to 5,800, citing stronger-than-expected earnings revisions, AI capex cycle, and resilient consumer spending.', sentiment: 'positive' },
  { symbol: undefined, title: 'Oil Slides 2% on Rising OPEC Production Signals', url: 'https://example.com/m5', publisher: 'CNBC', timestamp: Date.now() - 12 * 3600000, snippet: 'Crude oil fell 2.1% after reports that OPEC+ members are considering unwinding additional voluntary production cuts. WTI traded near $78.40 per barrel.', sentiment: 'negative' },
]

export class MockResearchAdapter implements ResearchProvider {
  async search(query: string): Promise<SearchResult[]> {
    const q = query.toLowerCase()
    const results: SearchResult[] = []

    // Return relevant market news based on query keywords
    const allNews = [...MARKET_NEWS, ...Object.values(MOCK_NEWS).flat()]
    for (const item of allNews) {
      if (item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q)) {
        results.push({ title: item.title, url: item.url, publisher: item.publisher, timestamp: item.timestamp, snippet: item.snippet, fetchedAt: Date.now() })
      }
    }

    if (results.length === 0) {
      results.push({
        title: `Research Results: ${query}`,
        url: 'https://example.com/search',
        publisher: 'Mock Research Engine',
        timestamp: Date.now(),
        snippet: `Aggregated research findings for "${query}". This is a placeholder result from the mock research adapter. Configure a real research provider (Perplexity, Tavily) via environment variables for live data.`,
        fetchedAt: Date.now(),
      })
    }

    return results.slice(0, 5)
  }

  async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    const sym = symbol.toUpperCase()
    const items = MOCK_NEWS[sym] ?? MOCK_NEWS['AAPL']!
    return items.map(n => ({ ...n, id: uid(), symbol: sym, fetchedAt: Date.now() }))
  }

  async getMarketNews(): Promise<NewsItem[]> {
    return MARKET_NEWS.map(n => ({ ...n, id: uid(), fetchedAt: Date.now() }))
  }

  async fetchUrl(url: string): Promise<string> {
    return `[Mock content from ${url}]\n\nThis is placeholder content. Configure RESEARCH_PROVIDER environment variable to enable real URL fetching.`
  }
}
