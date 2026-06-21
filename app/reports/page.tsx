'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import MarkdownViewer from '@/components/ui/MarkdownViewer'
import EmptyState from '@/components/ui/EmptyState'
import { ResearchReport } from '@/lib/types'
import Link from 'next/link'

const TYPE_META: Record<string, { label: string; color: 'blue' | 'green' | 'yellow' | 'muted' }> = {
  'morning-brief': { label: 'Morning Brief', color: 'blue' },
  'ticker-deep-dive': { label: 'Ticker Research', color: 'green' },
  'strategy-backtest': { label: 'Backtest Report', color: 'yellow' },
  'weekly-review': { label: 'Weekly Review', color: 'muted' },
  'earnings-preview': { label: 'Earnings Preview', color: 'yellow' },
}

function ReportsContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id')

  const [reports, setReports] = useState<ResearchReport[]>([])
  const [selected, setSelected] = useState<ResearchReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(d => {
      if (d.success) {
        setReports(d.data)
        if (initialId) {
          const r = d.data.find((r: ResearchReport) => r.id === initialId)
          if (r) setSelected(r)
        } else if (d.data.length > 0) {
          setSelected(d.data[0])
        }
      }
      setLoading(false)
    })
  }, [initialId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">All Reports ({reports.length})</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="shimmer-bg h-12 rounded-lg" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-xs text-slate-600 py-4 text-center">
              No reports yet.<br />
              <Link href="/morning-brief" className="text-market-blue hover:underline">Generate a brief →</Link>
            </div>
          ) : (
            <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {reports.map(r => {
                const meta = TYPE_META[r.reportType]
                return (
                  <button key={r.id} onClick={() => setSelected(r)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                    style={selected?.id === r.id
                      ? { background: 'rgba(61,126,255,0.15)', border: '1px solid rgba(61,126,255,0.3)' }
                      : { border: '1px solid transparent' }}>
                    <div className="text-xs font-medium text-slate-300 truncate mb-1">{r.title}</div>
                    <div className="flex items-center gap-1.5">
                      {meta && <Badge variant={meta.color} className="text-[9px]">{meta.label}</Badge>}
                      <span className="text-[10px] text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        {!selected ? (
          <Card>
            <EmptyState icon="⊟" title="Select a report" description="Choose a report from the list to view its content." />
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-terminal-border">
              <div>
                <h2 className="text-base font-bold text-white">{selected.title}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  {TYPE_META[selected.reportType] && (
                    <Badge variant={TYPE_META[selected.reportType]!.color}>{TYPE_META[selected.reportType]!.label}</Badge>
                  )}
                  <span className="text-xs text-slate-500">{new Date(selected.createdAt).toLocaleString()}</span>
                  {selected.symbols.length > 0 && (
                    <div className="flex gap-1">
                      {selected.symbols.map(s => (
                        <Link key={s} href={`/ticker/${s}`}
                          className="text-[10px] font-mono badge-blue px-1.5 py-0.5 rounded hover:opacity-80">{s}</Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <MarkdownViewer content={selected.content} />
            {selected.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-terminal-border">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sources ({selected.sources.length})</div>
                <div className="space-y-1">
                  {selected.sources.slice(0, 10).map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-market-blue transition-colors group">
                      <span className="text-market-blue group-hover:opacity-80">↗</span>
                      <span className="truncate">{s.title}</span>
                      {s.publisher && <span className="text-slate-700 shrink-0">— {s.publisher}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <PageLayout title="Reports" subtitle="All generated research reports and briefs">
      <Suspense fallback={<div className="shimmer-bg h-64 rounded-xl" />}>
        <ReportsContent />
      </Suspense>
    </PageLayout>
  )
}
