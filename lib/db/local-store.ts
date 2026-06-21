import { Watchlist, WatchedAsset, ResearchReport, Strategy, BacktestRun, AgentRun } from '@/lib/types'

// Module-level in-memory store — persists for the server process lifetime.
// Replace individual methods with Supabase calls once SUPABASE_URL is configured.

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Watchlists ───────────────────────────────────────────────────────────────

let watchlists: Watchlist[] = [
  {
    id: 'default',
    name: 'My Watchlist',
    description: 'Primary watchlist',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let watchedAssets: WatchedAsset[] = [
  { id: uid(), watchlistId: 'default', symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetType: 'etf', addedAt: new Date().toISOString() },
  { id: uid(), watchlistId: 'default', symbol: 'QQQ', name: 'Invesco QQQ Trust', assetType: 'etf', addedAt: new Date().toISOString() },
  { id: uid(), watchlistId: 'default', symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock', addedAt: new Date().toISOString() },
  { id: uid(), watchlistId: 'default', symbol: 'NVDA', name: 'NVIDIA Corporation', assetType: 'stock', addedAt: new Date().toISOString() },
  { id: uid(), watchlistId: 'default', symbol: 'TSLA', name: 'Tesla, Inc.', assetType: 'stock', addedAt: new Date().toISOString() },
]

export const db = {
  // Watchlists
  getWatchlists: (): Watchlist[] => watchlists,
  getWatchlist: (id: string): Watchlist | undefined => watchlists.find(w => w.id === id),
  createWatchlist: (data: Omit<Watchlist, 'id' | 'createdAt' | 'updatedAt'>): Watchlist => {
    const wl: Watchlist = { ...data, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    watchlists.push(wl)
    return wl
  },
  deleteWatchlist: (id: string): void => {
    watchlists = watchlists.filter(w => w.id !== id)
    watchedAssets = watchedAssets.filter(a => a.watchlistId !== id)
  },

  // Watched Assets
  getWatchedAssets: (watchlistId: string): WatchedAsset[] =>
    watchedAssets.filter(a => a.watchlistId === watchlistId),
  getAllWatchedAssets: (): WatchedAsset[] => watchedAssets,
  addWatchedAsset: (data: Omit<WatchedAsset, 'id' | 'addedAt'>): WatchedAsset => {
    const existing = watchedAssets.find(a => a.watchlistId === data.watchlistId && a.symbol === data.symbol)
    if (existing) return existing
    const asset: WatchedAsset = { ...data, id: uid(), addedAt: new Date().toISOString() }
    watchedAssets.push(asset)
    return asset
  },
  removeWatchedAsset: (id: string): void => {
    watchedAssets = watchedAssets.filter(a => a.id !== id)
  },
  getWatchedSymbols: (watchlistId = 'default'): string[] =>
    watchedAssets.filter(a => a.watchlistId === watchlistId).map(a => a.symbol),

  // Reports
  reports: [] as ResearchReport[],
  getReports: (): ResearchReport[] => db.reports,
  getReport: (id: string): ResearchReport | undefined => db.reports.find(r => r.id === id),
  saveReport: (report: Omit<ResearchReport, 'id'>): ResearchReport => {
    const r: ResearchReport = { ...report, id: uid() }
    db.reports.unshift(r)
    if (db.reports.length > 50) db.reports.pop()  // keep last 50
    return r
  },

  // Strategies
  strategies: [] as Strategy[],
  getStrategies: (): Strategy[] => db.strategies,
  getStrategy: (id: string): Strategy | undefined => db.strategies.find(s => s.id === id),
  saveStrategy: (s: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Strategy => {
    const strategy: Strategy = { ...s, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    db.strategies.push(strategy)
    return strategy
  },

  // Backtest Runs
  backtestRuns: [] as BacktestRun[],
  getBacktestRuns: (): BacktestRun[] => db.backtestRuns,
  getBacktestRun: (id: string): BacktestRun | undefined => db.backtestRuns.find(b => b.id === id),
  saveBacktestRun: (run: Omit<BacktestRun, 'id'>): BacktestRun => {
    const r: BacktestRun = { ...run, id: uid() }
    db.backtestRuns.unshift(r)
    return r
  },
  updateBacktestRun: (id: string, update: Partial<BacktestRun>): void => {
    const idx = db.backtestRuns.findIndex(b => b.id === id)
    if (idx !== -1) db.backtestRuns[idx] = { ...db.backtestRuns[idx], ...update }
  },

  // Agent Runs
  agentRuns: [] as AgentRun[],
  getAgentRuns: (): AgentRun[] => db.agentRuns,
  saveAgentRun: (run: Omit<AgentRun, 'id'>): AgentRun => {
    const r: AgentRun = { ...run, id: uid() }
    db.agentRuns.unshift(r)
    if (db.agentRuns.length > 100) db.agentRuns.pop()
    return r
  },
}
