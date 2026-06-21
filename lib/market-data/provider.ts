import { Candle, Quote, CompanyProfile, EarningsEvent } from '@/lib/types'

export interface MarketDataProvider {
  getDailyCandles(symbol: string, from: Date, to: Date): Promise<Candle[]>
  getIntradayCandles(symbol: string, intervalMinutes: number): Promise<Candle[]>
  getQuote(symbol: string): Promise<Quote>
  getCompanyProfile(symbol: string): Promise<CompanyProfile>
  getEarningsCalendar(symbol: string): Promise<EarningsEvent[]>
}

export function getMarketDataProvider(): MarketDataProvider {
  const providerName = process.env.MARKET_DATA_PROVIDER || 'mock'

  if (providerName === 'finnhub' && process.env.FINNHUB_API_KEY) {
    const { FinnhubAdapter } = require('./finnhub-adapter')
    return new FinnhubAdapter(process.env.FINNHUB_API_KEY)
  }
  if (providerName === 'alpha-vantage' && process.env.ALPHA_VANTAGE_API_KEY) {
    const { AlphaVantageAdapter } = require('./alpha-vantage-adapter')
    return new AlphaVantageAdapter(process.env.ALPHA_VANTAGE_API_KEY)
  }

  const { MockMarketAdapter } = require('./mock-adapter')
  return new MockMarketAdapter()
}
