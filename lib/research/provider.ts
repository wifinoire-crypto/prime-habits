import { NewsItem, SearchResult } from '@/lib/types'

export interface ResearchProvider {
  search(query: string): Promise<SearchResult[]>
  getCompanyNews(symbol: string): Promise<NewsItem[]>
  getMarketNews(): Promise<NewsItem[]>
  fetchUrl(url: string): Promise<string>
}

export function getResearchProvider(): ResearchProvider {
  const providerName = process.env.RESEARCH_PROVIDER || 'mock'

  if (providerName === 'perplexity' && process.env.PERPLEXITY_API_KEY) {
    const { PerplexityAdapter } = require('./perplexity-adapter')
    return new PerplexityAdapter(process.env.PERPLEXITY_API_KEY)
  }
  if (providerName === 'tavily' && process.env.TAVILY_API_KEY) {
    const { TavilyAdapter } = require('./tavily-adapter')
    return new TavilyAdapter(process.env.TAVILY_API_KEY)
  }

  const { MockResearchAdapter } = require('./mock-adapter')
  return new MockResearchAdapter()
}
