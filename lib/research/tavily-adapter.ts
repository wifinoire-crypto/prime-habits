import axios from 'axios'
import { NewsItem, SearchResult } from '@/lib/types'
import { ResearchProvider } from './provider'

function uid() { return Math.random().toString(36).slice(2) }

interface TavilyResult {
  title: string
  url: string
  content: string
  published_date?: string
}

export class TavilyAdapter implements ResearchProvider {
  private readonly base = 'https://api.tavily.com'

  constructor(private apiKey: string) {}

  private async search_raw(query: string, topic = 'news'): Promise<TavilyResult[]> {
    const res = await axios.post(
      `${this.base}/search`,
      { api_key: this.apiKey, query, topic, max_results: 5, include_raw_content: false },
      { timeout: 10000 }
    )
    return res.data.results ?? []
  }

  async search(query: string): Promise<SearchResult[]> {
    const results = await this.search_raw(query)
    return results.map(r => ({
      title: r.title,
      url: r.url,
      publisher: new URL(r.url).hostname.replace('www.', ''),
      timestamp: r.published_date ? new Date(r.published_date).getTime() : Date.now(),
      snippet: r.content.slice(0, 400),
      fetchedAt: Date.now(),
    }))
  }

  async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    const results = await this.search_raw(`${symbol} stock news earnings analyst`, 'news')
    return results.map((r, i) => ({
      id: uid(),
      symbol,
      title: r.title,
      url: r.url,
      publisher: new URL(r.url).hostname.replace('www.', ''),
      timestamp: r.published_date ? new Date(r.published_date).getTime() : Date.now() - i * 3600000,
      snippet: r.content.slice(0, 400),
      fetchedAt: Date.now(),
    }))
  }

  async getMarketNews(): Promise<NewsItem[]> {
    const results = await this.search_raw('US stock market news S&P 500 Nasdaq today', 'news')
    return results.map((r, i) => ({
      id: uid(),
      title: r.title,
      url: r.url,
      publisher: new URL(r.url).hostname.replace('www.', ''),
      timestamp: r.published_date ? new Date(r.published_date).getTime() : Date.now() - i * 1800000,
      snippet: r.content.slice(0, 400),
      fetchedAt: Date.now(),
    }))
  }

  async fetchUrl(url: string): Promise<string> {
    const res = await axios.post(
      `${this.base}/extract`,
      { api_key: this.apiKey, urls: [url] },
      { timeout: 10000 }
    )
    return res.data.results?.[0]?.raw_content ?? ''
  }
}
