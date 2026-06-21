// ─── Watchlist ───────────────────────────────────────────────────────────────

export interface Watchlist {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface WatchedAsset {
  id: string
  watchlistId: string
  symbol: string
  name?: string
  assetType: 'stock' | 'etf' | 'crypto' | 'index'
  notes?: string
  addedAt: string
}

// ─── Market Data ─────────────────────────────────────────────────────────────

export interface Candle {
  timestamp: number  // Unix ms
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  marketCap?: number
  timestamp: number
}

export interface CompanyProfile {
  symbol: string
  name: string
  description?: string
  sector?: string
  industry?: string
  country?: string
  exchange?: string
  marketCap?: number
  employees?: number
  website?: string
  logo?: string
  peRatio?: number
  weekHigh52?: number
  weekLow52?: number
}

export interface EarningsEvent {
  symbol: string
  date: string
  quarter?: string
  epsEstimate?: number
  epsActual?: number
  revenueEstimate?: number
  revenueActual?: number
  surprise?: number
}

// ─── Research / News ─────────────────────────────────────────────────────────

export interface NewsItem {
  id: string
  symbol?: string
  title: string
  url: string
  publisher: string
  timestamp: number
  snippet: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  fetchedAt: number
}

export interface SearchResult {
  title: string
  url: string
  publisher?: string
  timestamp?: number
  snippet: string
  fetchedAt: number
}

// ─── Indicators ──────────────────────────────────────────────────────────────

export interface MACDResult {
  macd: number
  signal: number
  histogram: number
}

export interface BollingerResult {
  upper: number
  middle: number
  lower: number
  bandwidth: number
}

export interface IndicatorResult {
  symbol: string
  timestamp: number
  price: number
  rsi14: number | null
  macd: MACDResult | null
  ema20: number | null
  ema50: number | null
  sma200: number | null
  bollingerBands: BollingerResult | null
  atr14: number | null
  weekHigh52: number | null
  weekLow52: number | null
  distanceFrom52wHigh: number | null
  distanceFrom52wLow: number | null
  volumeChange: number | null
  avgVolume20: number | null
  relativeVolume: number | null
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportType =
  | 'morning-brief'
  | 'ticker-deep-dive'
  | 'earnings-preview'
  | 'strategy-backtest'
  | 'weekly-review'
  | 'opportunity-watchlist'

export interface ResearchReport {
  id: string
  reportType: ReportType
  title: string
  content: string  // Markdown
  symbols: string[]
  sources: SearchResult[]
  indicators?: IndicatorResult[]
  createdAt: string
  agentRunId?: string
}

// ─── Strategies & Backtesting ─────────────────────────────────────────────────

export interface StrategyRule {
  field: string
  operator: '>' | '<' | '>=' | '<=' | '==' | 'crosses_above' | 'crosses_below'
  value: number
  indicatorRef?: string
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
export type PositionSizing = 'fixed' | 'risk-based' | 'kelly'

export interface Strategy {
  id: string
  name: string
  description?: string
  assetUniverse: string[]
  timeframe: Timeframe
  entryRules: StrategyRule[]
  exitRules: StrategyRule[]
  stopLoss?: number
  takeProfit?: number
  positionSizing: PositionSizing
  maxDrawdownRule?: number
  feesPercent?: number
  slippagePercent?: number
  createdAt: string
  updatedAt: string
}

export interface BacktestTrade {
  entryDate: string
  exitDate: string
  symbol: string
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  returnPct: number
  pnl: number
}

export interface EquityPoint {
  date: string
  value: number
}

export interface BacktestResult {
  totalReturn: number
  cagr: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  sharpeRatio: number | null
  tradeCount: number
  avgWin: number
  avgLoss: number
  equityCurve: EquityPoint[]
  trades: BacktestTrade[]
  benchmarkReturn?: number
}

export interface BacktestRun {
  id: string
  strategyId: string
  strategyName: string
  fromDate: string
  toDate: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: BacktestResult
  report?: string
  error?: string
  createdAt: string
  completedAt?: string
}

// ─── Agent / Tools ────────────────────────────────────────────────────────────

export type AgentType =
  | 'morning-brief'
  | 'ticker-research'
  | 'strategy-builder'
  | 'backtest-review'
  | 'risk'

export type ToolName =
  | 'web_search'
  | 'market_data_fetch'
  | 'news_fetch'
  | 'sec_filing_fetch'
  | 'indicator_calculate'
  | 'backtest_run'
  | 'report_write'
  | 'task_create'
  | 'memory_write'

export interface ToolResult {
  id: string
  agentRunId: string
  toolName: ToolName
  status: 'success' | 'failed'
  inputSummary: string
  outputSummary?: string
  sourceUrls?: string[]
  error?: string
  timestamp: string
}

export interface AgentRun {
  id: string
  agentType: AgentType
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  startedAt: string
  completedAt?: string
  toolResults: ToolResult[]
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface UserSettings {
  id: string
  theme: 'dark'
  defaultWatchlistId?: string
  marketDataProvider: 'finnhub' | 'polygon' | 'alpha-vantage' | 'mock'
  researchProvider: 'perplexity' | 'brave' | 'tavily' | 'mock'
  aiModel: string
  briefSchedule?: string
  timezone: string
  currency: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}
