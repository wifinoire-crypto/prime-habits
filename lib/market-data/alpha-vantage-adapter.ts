import axios from 'axios'
import { Candle, Quote, CompanyProfile, EarningsEvent } from '@/lib/types'
import { MarketDataProvider } from './provider'

const BASE = 'https://www.alphavantage.co/query'

export class AlphaVantageAdapter implements MarketDataProvider {
  constructor(private apiKey: string) {}

  private get(params: Record<string, string>) {
    return axios.get(BASE, { params: { ...params, apikey: this.apiKey }, timeout: 10000 })
  }

  async getDailyCandles(symbol: string, from: Date, to: Date): Promise<Candle[]> {
    const res = await this.get({ function: 'TIME_SERIES_DAILY_ADJUSTED', symbol, outputsize: 'full' })
    const series = res.data['Time Series (Daily)'] ?? {}
    return Object.entries(series)
      .map(([date, v]: [string, unknown]) => {
        const vals = v as Record<string, string>
        const ts = new Date(date).getTime()
        return { timestamp: ts, open: +vals['1. open'], high: +vals['2. high'], low: +vals['3. low'], close: +vals['5. adjusted close'], volume: +vals['6. volume'] }
      })
      .filter(c => c.timestamp >= from.getTime() && c.timestamp <= to.getTime())
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  async getIntradayCandles(symbol: string, intervalMinutes: number): Promise<Candle[]> {
    const res = await this.get({ function: 'TIME_SERIES_INTRADAY', symbol, interval: `${intervalMinutes}min`, outputsize: 'compact' })
    const key = Object.keys(res.data).find(k => k.startsWith('Time Series'))
    if (!key) return []
    const series = res.data[key] ?? {}
    return Object.entries(series)
      .map(([date, v]: [string, unknown]) => {
        const vals = v as Record<string, string>
        return { timestamp: new Date(date).getTime(), open: +vals['1. open'], high: +vals['2. high'], low: +vals['3. low'], close: +vals['4. close'], volume: +vals['5. volume'] }
      })
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  async getQuote(symbol: string): Promise<Quote> {
    const res = await this.get({ function: 'GLOBAL_QUOTE', symbol })
    const d = res.data['Global Quote'] ?? {}
    const price = +d['05. price']
    const prevClose = +d['08. previous close']
    return {
      symbol,
      price,
      change: price - prevClose,
      changePercent: +d['10. change percent']?.replace('%', ''),
      open: +d['02. open'],
      high: +d['03. high'],
      low: +d['04. low'],
      previousClose: prevClose,
      volume: +d['06. volume'],
      timestamp: Date.now(),
    }
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const res = await this.get({ function: 'OVERVIEW', symbol })
    const d = res.data
    return {
      symbol,
      name: d.Name ?? symbol,
      description: d.Description,
      sector: d.Sector,
      industry: d.Industry,
      country: d.Country,
      exchange: d.Exchange,
      marketCap: +d.MarketCapitalization || undefined,
      employees: +d.FullTimeEmployees || undefined,
      website: d.OfficialSite,
      peRatio: +d.PERatio || undefined,
      weekHigh52: +d['52WeekHigh'] || undefined,
      weekLow52: +d['52WeekLow'] || undefined,
    }
  }

  async getEarningsCalendar(symbol: string): Promise<EarningsEvent[]> {
    const res = await this.get({ function: 'EARNINGS', symbol })
    const items = res.data?.quarterlyEarnings ?? []
    return items.slice(0, 8).map((e: Record<string, string>) => ({
      symbol,
      date: e.reportedDate ?? e.fiscalDateEnding,
      quarter: e.fiscalDateEnding,
      epsEstimate: +e.estimatedEPS || undefined,
      epsActual: +e.reportedEPS || undefined,
      surprise: +e.surprisePercentage || undefined,
    }))
  }
}
