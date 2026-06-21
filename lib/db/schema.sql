-- Trading Intelligence Agent — Supabase / Postgres Schema
-- Run this in your Supabase SQL editor to enable persistent storage.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Watchlists ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watched_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  asset_type TEXT DEFAULT 'stock' CHECK (asset_type IN ('stock','etf','crypto','index')),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (watchlist_id, symbol)
);

-- ─── Asset Snapshots (price caches) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  price NUMERIC(18,4),
  change_pct NUMERIC(8,4),
  volume BIGINT,
  market_cap BIGINT,
  snapshotted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON asset_snapshots (symbol, snapshotted_at DESC);

-- ─── News Items ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  publisher TEXT,
  published_at TIMESTAMPTZ,
  snippet TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive','negative','neutral')),
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON news_items (symbol, published_at DESC);

-- ─── Research Reports ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS research_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,  -- Markdown
  symbols TEXT[] DEFAULT '{}',
  sources JSONB DEFAULT '[]',
  indicators JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  agent_run_id UUID
);

CREATE INDEX ON research_reports (report_type, created_at DESC);

-- ─── Strategies ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  asset_universe TEXT[] DEFAULT '{}',
  timeframe TEXT DEFAULT '1d',
  entry_rules JSONB DEFAULT '[]',
  exit_rules JSONB DEFAULT '[]',
  stop_loss NUMERIC(8,4),
  take_profit NUMERIC(8,4),
  position_sizing TEXT DEFAULT 'fixed',
  max_drawdown_rule NUMERIC(8,4),
  fees_percent NUMERIC(6,4) DEFAULT 0.1,
  slippage_percent NUMERIC(6,4) DEFAULT 0.05,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Backtest Runs ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS backtest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  strategy_name TEXT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  result JSONB,
  report TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── Agent Runs ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  input JSONB DEFAULT '{}',
  output JSONB,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── Tool Results ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tool_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  input_summary TEXT,
  output_summary TEXT,
  source_urls TEXT[],
  error TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Settings ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_data_provider TEXT DEFAULT 'mock',
  research_provider TEXT DEFAULT 'mock',
  ai_model TEXT DEFAULT 'claude-haiku-4-5-20251001',
  default_watchlist_id UUID REFERENCES watchlists(id) ON DELETE SET NULL,
  brief_schedule TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  currency TEXT DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seed default watchlist ───────────────────────────────────────────────────

INSERT INTO watchlists (id, name, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'My Watchlist', 'Primary watchlist')
ON CONFLICT (id) DO NOTHING;

INSERT INTO watched_assets (watchlist_id, symbol, name, asset_type) VALUES
  ('00000000-0000-0000-0000-000000000001', 'SPY', 'SPDR S&P 500 ETF Trust', 'etf'),
  ('00000000-0000-0000-0000-000000000001', 'QQQ', 'Invesco QQQ Trust', 'etf'),
  ('00000000-0000-0000-0000-000000000001', 'AAPL', 'Apple Inc.', 'stock'),
  ('00000000-0000-0000-0000-000000000001', 'NVDA', 'NVIDIA Corporation', 'stock'),
  ('00000000-0000-0000-0000-000000000001', 'TSLA', 'Tesla, Inc.', 'stock')
ON CONFLICT (watchlist_id, symbol) DO NOTHING;
