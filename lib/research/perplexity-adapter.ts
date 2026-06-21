import axios from 'axios'
import { NewsItem, SearchResult } from '@/lib/types'
import { ResearchProvider } from './provider'

function uid() { return Math.random().toString(36).slice(2) }

function safeHostname(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return 'source' }
}

export class PerplexityAdapter implements ResearchProvider {
  private readonly base = 'https://api.perplexity.ai'

  constructor(private apiKey: string) {}

  private async chat(userMsg: string): Promise<{ content: string; citations: string[] }> {
    const res = await axios.post(
      `${this.base}/chat/completions`,
      {
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'You are a financial research assistant. Provide factual, sourced information about markets and companies.' },
          { role: 'user', content: userMsg },
        ],
        max_tokens: 1024,
        return_citations: true,
        return_images: false,
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        timeout: 20000,
      }
    )
    const content: string = res.data.choices[0]?.message?.content ?? ''
    const citations: string[] = (res.data.citations ?? []).filter((u: string) => u?.startsWith('http'))
    return { content, citations }
  }

  async search(query: string): Promise<SearchResult[]> {
    const { content, citations } = await this.chat(`Search and summarize: ${query}`)
    return citations.length > 0
      ? citations.map(url => ({ title: safeHostname(url), url, snippet: content.slice(0, 300), fetchedAt: Date.now() }))
      : [{ title: query, url: '', snippet: content, fetchedAt: Date.now() }]
  }

  async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    const { content, citations } = await this.chat(
      `What are the latest significant news and developments about ${symbol} stock in the past 7 days? List specific events, earnings, analyst actions, and price catalysts.`
    )
    if (citations.length === 0) {
      return [{
        id: uid(), symbol, title: `${symbol} — Latest Developments`,
        url: '', publisher: 'Perplexity AI',
        timestamp: Date.now(), snippet: content.slice(0, 500), fetchedAt: Date.now(),
      }]
    }
    return citations.map((url, i) => ({
      id: uid(), symbol,
      title: `${symbol}: ${content.split('.')[i] ?? `Update ${i + 1}`}`.slice(0, 100),
      url,
      publisher: safeHostname(url),
      timestamp: Date.now() - i * 3600000,
      snippet: content.slice(i * 200, (i + 1) * 200) || content.slice(0, 200),
      fetchedAt: Date.now(),
    }))
  }

  async getMarketNews(): Promise<NewsItem[]> {
    const { content, citations } = await this.chat(
      'What are the top 5 market-moving news stories today? Focus on US equities, macro economy, Fed policy, and major sector moves. Be specific with tickers and numbers.'
    )
    if (citations.length === 0) {
      return [{
        id: uid(), title: 'Market Update', url: '', publisher: 'Perplexity AI',
        timestamp: Date.now(), snippet: content.slice(0, 500), fetchedAt: Date.now(),
      }]
    }
    return citations.map((url, i) => ({
      id: uid(),
      title: `Market Update ${i + 1}: ${content.split('.')[i] ?? ''}`.slice(0, 100),
      url,
      publisher: safeHostname(url),
      timestamp: Date.now() - i * 1800000,
      snippet: content.slice(i * 150, (i + 1) * 150) || content.slice(0, 150),
      fetchedAt: Date.now(),
    }))
  }

  async fetchUrl(url: string): Promise<string> {
    const { content } = await this.chat(`Summarize the key financial information from this URL: ${url}`)
    return content
  }
}
