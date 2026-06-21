import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    marketDataProvider: process.env.MARKET_DATA_PROVIDER || 'mock',
    finnhubKey: !!process.env.FINNHUB_API_KEY,
    alphaVantageKey: !!process.env.ALPHA_VANTAGE_API_KEY,
    researchProvider: process.env.RESEARCH_PROVIDER || 'mock',
    perplexityKey: !!process.env.PERPLEXITY_API_KEY,
    tavilyKey: !!process.env.TAVILY_API_KEY,
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const activeMarket = env.finnhubKey && env.marketDataProvider === 'finnhub'
    ? 'finnhub'
    : env.alphaVantageKey && env.marketDataProvider === 'alpha-vantage'
    ? 'alpha-vantage'
    : 'mock'

  const activeResearch = env.perplexityKey && env.researchProvider === 'perplexity'
    ? 'perplexity'
    : env.tavilyKey && env.researchProvider === 'tavily'
    ? 'tavily'
    : 'mock'

  return NextResponse.json({
    status: 'ok',
    providers: {
      marketData: activeMarket,
      research: activeResearch,
      ai: env.anthropicKey ? `claude (${env.anthropicModel})` : 'template',
      database: env.supabaseUrl && env.supabaseAnon ? 'supabase' : 'in-memory',
    },
    keysDetected: env,
  })
}
