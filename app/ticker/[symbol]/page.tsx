'use client'

import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge, { ChangeBadge } from '@/components/ui/Badge'
import IndicatorGrid from '@/components/ticker/IndicatorGrid'
import NewsFeed from '@/components/ticker/NewsFeed'
import MarkdownViewer from '@/components/ui/MarkdownViewer'
import PriceChart from '@/components/ticker/PriceChart'
import { LoadingScreen } from '@/components/ui/Spinner'
import { Quote, CompanyProfile, IndicatorResult, NewsItem, EarningsEvent, Candle } from '@/lib/types'
import Link from 'next/link'

interface TickerData {
  quote: Quote
  profile: CompanyProfile
  indicators: IndicatorResult | null
  news: NewsItem[]
  earnings: EarningsEvent[]
  candles: Candle[]
  report?: string
}

export default function TickerPage({ params }: { params: { symbol: string } }) {
  const { symbol } = params
  const SYM = symbol.toUpperCase()

  const [data, setData] = useState<TickerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'indicators' | 'news' | 'report'>('overview')

  useEffect(() => {
    fetch(`/api/ticker/${SYM}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data)
        else setError(d.error ?? 'Failed to load')
        setLoading(false)
      })
      .catch(err => { setError(String(err)); setLoading(false) })
  }, [SYM])

  const generateReport = async () => {
    setGeneratingReport(true)
    const res = await fetch(`/api/ticker/${SYM}?report=true`).then(r => r.json())
    if (res.success) {
      setData(prev => prev ? { ...prev, report: res.data.report } : prev)
      setActiveTab('report')
    }
    setGeneratingReport(false)
  }

  const TABS = ['overview', 'indicators', 'news', 'report'] as const

  return (
    <PageLayout
      title={loading ? SYM : `${data?.profile.name ?? SYM} (${SYM})`}
      subtitle={loading ? '' : `${data?.profile.sector} · ${data?.profile.exchange}`}
      action={
        <div className="flex items-center gap-3">
          <Link href="/watchlist" className="text-sm text-slate-500 hover:text-slate-300">← Back</Link>
          <Button size="sm" onClick={generateReport} loading={generatingReport} variant="secondary">
            Generate Research Report
          </Button>
        </div>
      }>

      {loading && <LoadingScreen message={`Loading data for ${SYM}…`} />}
      {error && <div className="text-sm text-market-red p-4 card">{error}</div>}

      {data && !loading && (
        <>
          {/* Price header */}
          <Card className="p-5 mb-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-market-blue"
                  style={{ background: 'rgba(61,126,255,0.1)', border: '1px solid rgba(61,126,255,0.25)' }}>
                  {SYM.slice(0, 2)}
                </div>
                <div>
                  <div className="text-3xl font-bold text-white font-mono">${data.quote.price.toFixed(2)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <ChangeBadge value={data.quote.changePercent} />
                    <span className="text-sm text-slate-500">${data.quote.change > 0 ? '+' : ''}{data.quote.change.toFixed(2)} today</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-right">
                {[
                  { label: 'Open', value: `$${data.quote.open.toFixed(2)}` },
                  { label: 'High', value: `$${data.quote.high.toFixed(2)}` },
                  { label: 'Low', value: `$${data.quote.low.toFixed(2)}` },
                  { label: 'Prev Close', value: `$${data.quote.previousClose.toFixed(2)}` },
                  { label: 'Volume', value: `${(data.quote.volume / 1e6).toFixed(1)}M` },
                  { label: 'Mkt Cap', value: data.quote.marketCap ? `$${(data.quote.marketCap / 1e9).toFixed(1)}B` : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-sm font-semibold text-white font-mono">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: '#0a1428', border: '1px solid #162040', display: 'inline-flex' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={activeTab === tab
                  ? { background: 'rgba(61,126,255,0.2)', color: '#93b4ff', border: '1px solid rgba(61,126,255,0.3)' }
                  : { color: '#64748b', border: '1px solid transparent' }}>
                {tab === 'report' && data.report ? '✓ ' : ''}{tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {data.candles.length > 1 && (
                <PriceChart candles={data.candles} symbol={SYM} />
              )}
              <Card className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Company Overview</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{data.profile.description ?? 'No description available.'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Sector', value: data.profile.sector },
                    { label: 'Industry', value: data.profile.industry },
                    { label: 'Country', value: data.profile.country },
                    { label: 'Employees', value: data.profile.employees ? data.profile.employees.toLocaleString() : undefined },
                    { label: 'P/E Ratio', value: data.profile.peRatio?.toFixed(1) },
                    { label: '52W High', value: data.profile.weekHigh52 ? `$${data.profile.weekHigh52.toFixed(2)}` : undefined },
                    { label: '52W Low', value: data.profile.weekLow52 ? `$${data.profile.weekLow52.toFixed(2)}` : undefined },
                    { label: 'Exchange', value: data.profile.exchange },
                  ].filter(d => d.value).map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs text-slate-500">{label}</div>
                      <div className="text-sm font-medium text-white mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>
              </Card>
              {data.earnings.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Earnings Calendar</h3>
                  <div className="space-y-2">
                    {data.earnings.map((e, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-terminal-border last:border-0 text-sm">
                        <div>
                          <span className="font-medium text-white">{e.date}</span>
                          {e.quarter && <span className="text-slate-500 ml-2">{e.quarter}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          {e.epsEstimate !== undefined && <span className="text-slate-400">Est: ${e.epsEstimate.toFixed(2)}</span>}
                          {e.epsActual !== undefined && (
                            <Badge variant={e.epsActual >= (e.epsEstimate ?? 0) ? 'green' : 'red'}>
                              Act: ${e.epsActual.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'indicators' && data.indicators && (
            <IndicatorGrid indicators={data.indicators} />
          )}
          {activeTab === 'indicators' && !data.indicators && (
            <Card className="p-5"><p className="text-sm text-slate-500">Not enough historical data to calculate indicators.</p></Card>
          )}

          {activeTab === 'news' && <NewsFeed news={data.news} />}

          {activeTab === 'report' && (
            <Card className="p-6">
              {data.report ? (
                <MarkdownViewer content={data.report} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No research report generated yet.</p>
                  <Button onClick={generateReport} loading={generatingReport}>Generate Research Report</Button>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </PageLayout>
  )
}
