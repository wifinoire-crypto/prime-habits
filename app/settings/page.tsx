import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

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

// EnvStatus removed — process.env not accessible from client components.
// Status is shown statically; users configure keys in .env.local

export default function SettingsPage() {
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
              {group.items.map(item => (
                <div key={item.env} className="flex items-start gap-4 py-2.5 border-b border-terminal-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono text-market-blue">{item.env}</code>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    <p className="text-xs text-slate-600 mt-0.5 font-mono">{item.values}</p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <Badge variant="muted">Not set</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Card className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Example .env.local</h3>
          <pre className="text-xs font-mono text-slate-400 leading-relaxed overflow-x-auto p-4 rounded-lg" style={{ background: '#060d1f', border: '1px solid #162040' }}>
{`# Market Data
MARKET_DATA_PROVIDER=finnhub
FINNHUB_API_KEY=your_finnhub_key_here

# Research
RESEARCH_PROVIDER=perplexity
PERPLEXITY_API_KEY=your_perplexity_key_here

# AI Analysis
ANTHROPIC_API_KEY=your_anthropic_key_here
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

# Database (optional)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
          </pre>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">System Status</h3>
          <div className="space-y-2">
            {[
              { label: 'Mock Market Data', status: 'active', note: 'Always available as fallback' },
              { label: 'Mock Research/News', status: 'active', note: 'Pre-loaded realistic news for major tickers' },
              { label: 'Technical Indicators', status: 'active', note: 'RSI, MACD, EMA, SMA, Bollinger, ATR via technicalindicators' },
              { label: 'Report Generation', status: 'active', note: 'Template-based when no AI key; AI-powered with Anthropic key' },
              { label: 'Persistent Storage', status: 'limited', note: 'In-memory store (resets on server restart). Add Supabase for persistence.' },
            ].map(({ label, status, note }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-terminal-border last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-slate-500">{note}</div>
                </div>
                <Badge variant={status === 'active' ? 'green' : 'yellow'}>
                  {status === 'active' ? 'Active' : 'Limited'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
