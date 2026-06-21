import { Candle, Quote, CompanyProfile, EarningsEvent } from '@/lib/types'
import { MarketDataProvider } from './provider'

const PROFILES: Record<string, Partial<CompanyProfile>> = {
  SPY: { name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', exchange: 'NYSE Arca', description: 'The SPDR S&P 500 ETF Trust seeks to provide investment results that correspond generally to the price and yield performance of the S&P 500 Index.' },
  QQQ: { name: 'Invesco QQQ Trust', sector: 'ETF', exchange: 'NASDAQ', description: 'The Invesco QQQ Trust is an exchange-traded fund that tracks the Nasdaq-100 Index, representing 100 of the largest non-financial companies listed on Nasdaq.' },
  AAPL: { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', exchange: 'NASDAQ', description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', employees: 161000, website: 'https://www.apple.com', peRatio: 28.4 },
  NVDA: { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', description: 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.', employees: 29600, website: 'https://www.nvidia.com', peRatio: 45.2 },
  TSLA: { name: 'Tesla, Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', exchange: 'NASDAQ', description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.', employees: 127855, website: 'https://www.tesla.com', peRatio: 52.1 },
  MSFT: { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', exchange: 'NASDAQ', description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.', employees: 221000, website: 'https://www.microsoft.com', peRatio: 32.1 },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Services', exchange: 'NASDAQ', description: 'Alphabet Inc. provides online advertising services through Google Search, YouTube, and Google Network. Also operates Google Cloud.', employees: 182502, website: 'https://abc.xyz', peRatio: 22.4 },
  META: { name: 'Meta Platforms, Inc.', sector: 'Technology', industry: 'Social Media', exchange: 'NASDAQ', description: 'Meta Platforms builds technologies that help people connect, find communities, and grow businesses.', employees: 67317, website: 'https://about.meta.com', peRatio: 24.8 },
  AMZN: { name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail', exchange: 'NASDAQ', description: 'Amazon.com, Inc. engages in e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.', employees: 1541000, website: 'https://www.amazon.com', peRatio: 38.7 },
}

const BASE_PRICES: Record<string, number> = {
  SPY: 542.30,
  QQQ: 470.15,
  AAPL: 225.80,
  NVDA: 875.50,
  TSLA: 245.20,
  MSFT: 415.60,
  GOOGL: 175.90,
  META: 540.20,
  AMZN: 198.40,
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateCandles(symbol: string, days: number): Candle[] {
  const basePrice = BASE_PRICES[symbol] ?? 100
  const candles: Candle[] = []
  let price = basePrice * 0.85
  const now = Date.now()

  for (let i = days; i >= 0; i--) {
    const seed = symbol.charCodeAt(0) * 1000 + i
    const dayReturn = (seededRandom(seed) - 0.495) * 0.04  // ±2% daily
    const open = price
    const close = price * (1 + dayReturn)
    const high = Math.max(open, close) * (1 + seededRandom(seed + 1) * 0.015)
    const low = Math.min(open, close) * (1 - seededRandom(seed + 2) * 0.015)
    const volume = Math.floor(1e7 * (0.5 + seededRandom(seed + 3)))

    candles.push({
      timestamp: now - i * 86400000,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    })
    price = close
  }
  return candles
}

export class MockMarketAdapter implements MarketDataProvider {
  async getDailyCandles(symbol: string, from: Date, to: Date): Promise<Candle[]> {
    const days = Math.min(Math.ceil((to.getTime() - from.getTime()) / 86400000), 365)
    return generateCandles(symbol.toUpperCase(), days)
  }

  async getIntradayCandles(symbol: string, intervalMinutes: number): Promise<Candle[]> {
    const sym = symbol.toUpperCase()
    const basePrice = BASE_PRICES[sym] ?? 100
    const candles: Candle[] = []
    const intervalsPerDay = Math.floor(390 / intervalMinutes)  // 6.5 trading hours

    for (let i = intervalsPerDay - 1; i >= 0; i--) {
      const seed = sym.charCodeAt(0) * 500 + i
      const r = (seededRandom(seed) - 0.499) * 0.003
      const price = basePrice * (1 + r * (intervalsPerDay - i) / intervalsPerDay)
      candles.push({
        timestamp: Date.now() - i * intervalMinutes * 60000,
        open: +price.toFixed(2),
        high: +(price * 1.002).toFixed(2),
        low: +(price * 0.998).toFixed(2),
        close: +(price * (1 + r)).toFixed(2),
        volume: Math.floor(500000 * (0.5 + seededRandom(seed + 5))),
      })
    }
    return candles
  }

  async getQuote(symbol: string): Promise<Quote> {
    const sym = symbol.toUpperCase()
    const base = BASE_PRICES[sym] ?? 100
    const seed = sym.charCodeAt(0) + Date.now() % 10000
    const change = (seededRandom(seed) - 0.48) * base * 0.04
    const price = +(base + change).toFixed(2)
    return {
      symbol: sym,
      price,
      change: +change.toFixed(2),
      changePercent: +((change / base) * 100).toFixed(2),
      open: +(base * (1 + (seededRandom(seed + 1) - 0.5) * 0.01)).toFixed(2),
      high: +(price * 1.012).toFixed(2),
      low: +(price * 0.988).toFixed(2),
      previousClose: +base.toFixed(2),
      volume: Math.floor(20e6 * (0.5 + seededRandom(seed + 3))),
      marketCap: base * 1e9 * (5 + seededRandom(seed + 4) * 15),
      timestamp: Date.now(),
    }
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const sym = symbol.toUpperCase()
    const quote = await this.getQuote(sym)
    const base = PROFILES[sym] ?? {}
    return {
      symbol: sym,
      name: base.name ?? `${sym} Corporation`,
      description: base.description ?? `${sym} is a publicly traded company.`,
      sector: base.sector ?? 'Technology',
      industry: base.industry ?? 'Software',
      country: 'US',
      exchange: base.exchange ?? 'NASDAQ',
      marketCap: quote.marketCap,
      employees: base.employees ?? 5000,
      website: base.website ?? `https://www.${sym.toLowerCase()}.com`,
      peRatio: base.peRatio,
    }
  }

  async getEarningsCalendar(symbol: string): Promise<EarningsEvent[]> {
    const sym = symbol.toUpperCase()
    const today = new Date()
    const nextQ = new Date(today)
    nextQ.setDate(today.getDate() + 30)
    const seed = sym.charCodeAt(0) * 7
    return [
      {
        symbol: sym,
        date: nextQ.toISOString().split('T')[0],
        quarter: 'Q2 2025',
        epsEstimate: +(seededRandom(seed) * 3 + 0.5).toFixed(2),
      },
    ]
  }
}
