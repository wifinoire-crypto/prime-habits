import { supabaseAdmin as supabase } from './supabase'
import { db as local } from './local-store'
import type { Watchlist, WatchedAsset, ResearchReport, Strategy, BacktestRun, AgentRun, Timeframe } from '@/lib/types'

const DEFAULT_SUPABASE_WATCHLIST_ID = '00000000-0000-0000-0000-000000000001'

function resolveWatchlistId(id: string) {
  return id === 'default' ? DEFAULT_SUPABASE_WATCHLIST_ID : id
}

function assetFromRow(row: Record<string, unknown>): WatchedAsset {
  return {
    id: row.id as string,
    watchlistId: row.watchlist_id as string,
    symbol: row.symbol as string,
    name: row.name as string | undefined,
    assetType: row.asset_type as WatchedAsset['assetType'],
    notes: row.notes as string | undefined,
    addedAt: row.added_at as string,
  }
}

function reportFromRow(row: Record<string, unknown>): ResearchReport {
  return {
    id: row.id as string,
    reportType: row.report_type as ResearchReport['reportType'],
    title: row.title as string,
    content: row.content as string,
    symbols: (row.symbols as string[]) ?? [],
    sources: (row.sources as ResearchReport['sources']) ?? [],
    indicators: (row.indicators as ResearchReport['indicators']) ?? [],
    createdAt: row.created_at as string,
    agentRunId: row.agent_run_id as string | undefined,
  }
}

function strategyFromRow(row: Record<string, unknown>): Strategy {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    assetUniverse: (row.asset_universe as string[]) ?? [],
    timeframe: row.timeframe as Timeframe,
    entryRules: (row.entry_rules as Strategy['entryRules']) ?? [],
    exitRules: (row.exit_rules as Strategy['exitRules']) ?? [],
    stopLoss: row.stop_loss as number | undefined,
    takeProfit: row.take_profit as number | undefined,
    positionSizing: row.position_sizing as Strategy['positionSizing'],
    feesPercent: row.fees_percent as number,
    slippagePercent: row.slippage_percent as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export const db = {
  // ─── Watchlists ───────────────────────────────────────────────────────────
  async getWatchlists(): Promise<Watchlist[]> {
    if (!supabase) return local.getWatchlists()
    const { data } = await supabase.from('watchlists').select('*').order('created_at')
    return (data ?? []).map(r => ({
      id: r.id, name: r.name, description: r.description,
      createdAt: r.created_at, updatedAt: r.updated_at,
    }))
  },

  async getWatchedAssets(watchlistId: string): Promise<WatchedAsset[]> {
    if (!supabase) return local.getWatchedAssets(watchlistId)
    const { data } = await supabase
      .from('watched_assets')
      .select('*')
      .eq('watchlist_id', resolveWatchlistId(watchlistId))
      .order('added_at')
    return (data ?? []).map(assetFromRow)
  },

  async getAllWatchedAssets(): Promise<WatchedAsset[]> {
    if (!supabase) return local.getAllWatchedAssets()
    const { data } = await supabase.from('watched_assets').select('*').order('added_at')
    return (data ?? []).map(assetFromRow)
  },

  async getWatchedSymbols(watchlistId = 'default'): Promise<string[]> {
    if (!supabase) return local.getWatchedSymbols(watchlistId)
    const { data } = await supabase
      .from('watched_assets')
      .select('symbol')
      .eq('watchlist_id', resolveWatchlistId(watchlistId))
    return (data ?? []).map(r => r.symbol as string)
  },

  async addWatchedAsset(data: Omit<WatchedAsset, 'id' | 'addedAt'>): Promise<WatchedAsset> {
    if (!supabase) return local.addWatchedAsset(data)
    const { data: row, error } = await supabase
      .from('watched_assets')
      .upsert({
        watchlist_id: resolveWatchlistId(data.watchlistId),
        symbol: data.symbol,
        name: data.name,
        asset_type: data.assetType,
        notes: data.notes,
      }, { onConflict: 'watchlist_id,symbol', ignoreDuplicates: true })
      .select()
      .single()
    if (error) throw error
    return assetFromRow(row)
  },

  async removeWatchedAsset(id: string): Promise<void> {
    if (!supabase) return local.removeWatchedAsset(id)
    await supabase.from('watched_assets').delete().eq('id', id)
  },

  // ─── Reports ──────────────────────────────────────────────────────────────
  async getReports(type?: string, limit = 50): Promise<ResearchReport[]> {
    if (!supabase) {
      const all = local.getReports()
      return (type ? all.filter(r => r.reportType === type) : all).slice(0, limit)
    }
    let q = supabase.from('research_reports').select('*').order('created_at', { ascending: false }).limit(limit)
    if (type) q = q.eq('report_type', type)
    const { data } = await q
    return (data ?? []).map(reportFromRow)
  },

  async getReport(id: string): Promise<ResearchReport | undefined> {
    if (!supabase) return local.getReport(id)
    const { data } = await supabase.from('research_reports').select('*').eq('id', id).single()
    return data ? reportFromRow(data) : undefined
  },

  async saveReport(report: Omit<ResearchReport, 'id'>): Promise<ResearchReport> {
    if (!supabase) return local.saveReport(report)
    const { data, error } = await supabase
      .from('research_reports')
      .insert({
        report_type: report.reportType,
        title: report.title,
        content: report.content,
        symbols: report.symbols,
        sources: report.sources,
        indicators: report.indicators,
        agent_run_id: report.agentRunId,
      })
      .select()
      .single()
    if (error) throw error
    return reportFromRow(data)
  },

  // ─── Strategies ───────────────────────────────────────────────────────────
  async getStrategies(): Promise<Strategy[]> {
    if (!supabase) return local.getStrategies()
    const { data } = await supabase.from('strategies').select('*').order('created_at', { ascending: false })
    return (data ?? []).map(strategyFromRow)
  },

  async getStrategy(id: string): Promise<Strategy | undefined> {
    if (!supabase) return local.getStrategy(id)
    const { data } = await supabase.from('strategies').select('*').eq('id', id).single()
    return data ? strategyFromRow(data) : undefined
  },

  async saveStrategy(s: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Strategy> {
    if (!supabase) return local.saveStrategy(s)
    const { data, error } = await supabase
      .from('strategies')
      .insert({
        name: s.name,
        description: s.description,
        asset_universe: s.assetUniverse,
        timeframe: s.timeframe,
        entry_rules: s.entryRules,
        exit_rules: s.exitRules,
        stop_loss: s.stopLoss,
        take_profit: s.takeProfit,
        position_sizing: s.positionSizing,
        fees_percent: s.feesPercent,
        slippage_percent: s.slippagePercent,
      })
      .select()
      .single()
    if (error) throw error
    return strategyFromRow(data)
  },

  // ─── Backtest Runs ────────────────────────────────────────────────────────
  async getBacktestRuns(): Promise<BacktestRun[]> {
    if (!supabase) return local.getBacktestRuns()
    const { data } = await supabase.from('backtest_runs').select('*').order('created_at', { ascending: false })
    return data ?? []
  },

  async saveBacktestRun(run: Omit<BacktestRun, 'id'>): Promise<BacktestRun> {
    if (!supabase) return local.saveBacktestRun(run)
    const { data, error } = await supabase.from('backtest_runs').insert(run).select().single()
    if (error) throw error
    return data
  },

  // ─── Agent Runs ───────────────────────────────────────────────────────────
  async saveAgentRun(run: Omit<AgentRun, 'id'>): Promise<AgentRun> {
    if (!supabase) return local.saveAgentRun(run)
    const { data, error } = await supabase
      .from('agent_runs')
      .insert({
        agent_type: run.agentType,
        status: run.status,
        input: run.input,
        output: run.output,
        error: run.error,
      })
      .select()
      .single()
    if (error) throw error
    return { ...run, id: data.id, startedAt: data.started_at }
  },
}
