import axios from 'axios'
import { Candle, Quote, CompanyProfile, EarningsEvent } from '@/lib/types'
import { MarketDataProvider } from './provider'

const BASE = 'https://finnhub.io/api/v1'

export class FinnhubAdapter implements MarketDataProvider {
  constructor(private apiKey: string) {}

  private get(path: string, params: Record<string, string | number> = {}) {
    return axios.get(`${BASE}${path}`, { params: { ...params, token: this.apiKey }, timeout: 8000 })
  }

  async getDailyCandles(symbol: string, from: Date, to: Date): Promise<Candle[]> {
    const res = await this.get('/stock/candle', {
      symbol,
      resolution: 'D',
      from: Math.floor(from.getTime() / 1000),
      to: Math.floor(to.getTime() / 1000),
    })
    const d = res.data
    if (d.s !== 'ok' || !d.t) return []
    return d.t.map((ts: number, i: number) => ({
      timestamp: ts * 1000,
      open: d.o[i],
      high: d.h[i],
      low: d.l[i],
      close: d.c[i],
      volume: d.v[i],
    }))
  }

  async getIntradayCandles(symbol: string, intervalMinutes: number): Promise<Candle[]> {
    const to = new Date()
    const from = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const res = await this.get('/stock/candle', {
      symbol,
      resolution: String(intervalMinutes),
      from: Math.floor(from.getTime() / 1000),
      to: Math.floor(to.getTime() / 1000),
    })
    const d = res.data
    if (d.s !== 'ok' || !d.t) return []
    return d.t.map((ts: number, i: number) => ({
      timestamp: ts * 1000,
      open: d.o[i],
      high: d.h[i],
      low: d.l[i],
      close: d.c[i],
      volume: d.v[i],
    }))
  }

  async getQuote(symbol: string): Promise<Quote> {
    const res = await this.get('/quote', { symbol })
    const d = res.data
    return {
      symbol,
      price: d.c,
      change: d.d,
      changePercent: d.dp,
      open: d.o,
      high: d.h,
      low: d.l,
      previousClose: d.pc,
      volume: 0,
      timestamp: Date.now(),
    }
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const res = await this.get('/stock/profile2', { symbol })
    const d = res.data
    return {
      symbol,
      name: d.name ?? symbol,
      description: undefined,
      sector: d.finnhubIndustry,
      exchange: d.exchange,
      country: d.country,
      marketCap: d.marketCapitalization ? d.marketCapitalization * 1e6 : undefined,
      employees: d.employeeTotal,
      website: d.weburl,
      logo: d.logo,
    }
  }

  async getEarningsCalendar(symbol: string): Promise<EarningsEvent[]> {
    const from = new Date().toISOString().split('T')[0]
    const to = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
    const res = await this.get('/calendar/earnings', { symbol, from, to })
    const items = res.data?.earningsCalendar ?? []
    return items.map((e: Record<string, unknown>) => ({
      symbol: e.symbol as string,
      date: e.date as string,
      quarter: e.quarter as string | undefined,
      epsEstimate: e.epsEstimate as number | undefined,
      epsActual: e.epsActual as number | undefined,
    }))
  }
}
