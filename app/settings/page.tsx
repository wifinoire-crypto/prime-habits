import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

function mask(val: string | undefined): string {
  if (!val) return ''
  if (val.length <= 8) return '••••••••'
  return val.slice(0, 6) + '••••••••' + val.slice(-3)
}

const CONFIG_ITEMS = [
  {
    group: 'Market Data',
    items: [
      { env: 'MARKET_DATA_PROVIDER', values: 'finnhub | alpha-vantage | mock', desc: 'Which market data provider to use (default: mock)' },
      { env: 'FINNHUB_API_KEY', values: 'your key', desc: 'Finnhub API key — get free at finnhub.io (60 req/min free tier)' },
      { env: 'ALPHA_VANTAGE_API_KEY', values: 'your key', desc: 'Alpha Vantage API key — free at alphavantage.co (5 req/min)' },
    ],
  },
  {
    group: 'Research & News',
    items: [
      { env: 'RESEARCH_PROVIDER', values: 'perplexity | tavily | mock', desc: 'Which research provider to use (default: mock)' },
      { env: 'PERPLEXITY_API_KEY', values: 'your key', desc: 'Perplexity API for AI-powered web search and news' },
      { env: 'TAVILY_API_KEY', values: 'your key', desc: 'Tavily API for financial news search' },
    ],
  },
  {
    group: 'AI Model',
    items: [
      { env: 'ANTHROPIC_API_KEY', values: 'your key', desc: 'Anthropic API key for AI analysis and report generation' },
      { env: 'ANTHROPIC_MODEL', values: 'claude-haiku-4-5-20251001 | claude-sonnet-4-6', desc: 'Which Claude model to use for report generation' },
    ],
  },
  {
    group: 'Database (Optional)',
    items: [
      { env: 'NEXT_PUBLIC_SUPABASE_URL', values: 'https://xxx.supabase.co', desc: 'Supabase project URL for persistent storage' },
      { env: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', values: 'your key', desc: 'Supabase anon key for client-side access' },
      { env: 'SUPABASE_SERVICE_ROLE_KEY', values: 'your key', desc: 'Supabase service role key — server-side only, bypasses RLS for API routes' },
    ],
  },
]

export default function SettingsPage() {
  const env = {
    MARKET_DATA_PROVIDER: process.env.MARKET_DATA_PROVIDER,
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    RESEARCH_PROVIDER: process.env.RESEARCH_PROVIDER,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  } as Record<string, string | undefined>

  const hasSupabase = !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const hasAI = !!env.ANTHROPIC_API_KEY
  const hasMarketData = !!(env.FINNHUB_API_KEY || env.ALPHA_VANTAGE_API_KEY)
  const hasResearch = !!(env.PERPLEXITY_API_KEY || env.TAVILY_API_KEY)

  const systemStatus = [
    { label: 'Mock Market Data', status: 'active' as const, note: 'Always available as fallback' },
    { label: 'Live Market Data', status: hasMarketData ? 'active' as const : 'limited' as const, note: hasMarketData ? `Provider: ${env.MARKET_DATA_PROVIDER ?? 'finnhub'}` : 'Add FINNHUB_API_KEY to enable' },
    { label: 'AI Report Generation', status: hasAI ? 'active' as const : 'limited' as const, note: hasAI ? `Model: ${env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'}` : 'Add ANTHROPIC_API_KEY to enable' },
    { label: 'Live News / Research', status: hasResearch ? 'active' as const : 'limited' as const, note: hasResearch ? `Provider: ${env.RESEARCH_PROVIDER ?? 'perplexity'}` : 'Add PERPLEXITY_API_KEY or TAVILY_API_KEY' },
    { label: 'Persistent Storage', status: hasSupabase ? 'active' as const : 'limited' as const, note: hasSupabase ? 'Supabase connected' : 'In-memory only — resets on server restart' },
  ]

  return (
    <PageLayout title="Settings" subtitle="Configure API keys and data providers">
      <div className="max-w-3xl space-y-5">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="text-market-yellow text-xl shrink-0">⚠</span>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Configuration via Environment Variables</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                All configuration is done via environment variables in <code className="text-market-blue">.env.local</code> in the project root.
                The app runs on realistic <strong className="text-white">mock data by default</strong> — no API keys required to explore all features.
              </p>
            </div>
          </div>
        </Card>

        {CONFIG_ITEMS.map(group => (
          <Card key={group.group} className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">{group.group}</h3>
            <div className="space-y-3">
              {group.items.map(item => {
                const val = env[item.env]
                const isSet = !!val
                return (
                  <div key={item.env} className="flex items-start gap-4 py-2.5 border-b border-terminal-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono text-market-blue">{item.env}</code>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      {isSet ? (
                        <p className="text-xs text-slate-600 mt-0.5 font-mono">{mask(val)}</p>
                      ) : (
                        <p className="text-xs text-slate-700 mt-0.5 font-mono">{item.values}</p>
                      )}
                    </div>
                    <div className="shrink-0 pt-0.5">
                      <Badge variant={isSet ? 'green' : 'muted'}>{isSet ? 'Set' : 'Not set'}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}

        <Card className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">System Status</h3>
          <div className="space-y-2">
            {systemStatus.map(({ label, status, note }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-terminal-border last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-slate-500">{note}</div>
                </div>
                <Badge variant={status === 'active' ? 'green' : 'yellow'}>
                  {status === 'active' ? 'Active' : 'Not configured'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Example .env.local</h3>
          <pre className="text-xs font-mono text-slate-400 leading-relaxed overflow-x-auto p-4 rounded-lg" style={{ background: '#060d1f', border: '1px solid #162040' }}>
{`# Market Data
MARKET_DATA_PROVIDER=finnhub
FINNHUB_API_KEY=your_finnhub_key_here

# Research
RESEARCH_PROVIDER=perplexity
PERPLEXITY_API_KEY=your_perplexity_key_here
TAVILY_API_KEY=your_tavily_key_here

# AI Analysis
ANTHROPIC_API_KEY=your_anthropic_key_here
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
          </pre>
        </Card>
      </div>
    </PageLayout>
  )
}
