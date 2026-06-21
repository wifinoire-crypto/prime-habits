'use client'

import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Button from '@/components/ui/Button'
import MarkdownViewer from '@/components/ui/MarkdownViewer'
import EmptyState from '@/components/ui/EmptyState'
import Card from '@/components/ui/Card'
import { ResearchReport } from '@/lib/types'

export default function MorningBriefPage() {
  const [reports, setReports] = useState<ResearchReport[]>([])
  const [selected, setSelected] = useState<ResearchReport | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [toolLog, setToolLog] = useState<Array<{ toolName: string; status: string; inputSummary: string }>>([])
  const [showLog, setShowLog] = useState(false)

  const loadReports = async () => {
    const res = await fetch('/api/morning-brief').then(r => r.json())
    if (res.success) {
      setReports(res.data)
      if (res.data.length > 0 && !selected) setSelected(res.data[0])
    }
  }

  useEffect(() => { loadReports() }, [])

  const generate = async () => {
    setGenerating(true)
    setError('')
    setToolLog([])
    try {
      const res = await fetch('/api/morning-brief', { method: 'POST' }).then(r => r.json())
      if (!res.success) { setError(res.error ?? 'Generation failed'); return }
      setToolLog(res.data.toolResults ?? [])
      await loadReports()
      setSelected(res.data.report)
    } catch (err) {
      setError('Network error: ' + String(err))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageLayout
      title="Morning Brief"
      subtitle="AI-generated daily market intelligence report"
      action={
        <div className="flex gap-3">
          {toolLog.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setShowLog(v => !v)}>
              {showLog ? 'Hide' : 'Show'} Tool Log ({toolLog.length})
            </Button>
          )}
          <Button onClick={generate} loading={generating}>
            {generating ? 'Generating…' : '☀ Generate Brief'}
          </Button>
        </div>
      }>

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm text-market-red bg-market-red-dim border border-market-red-border">
          {error}
        </div>
      )}

      {/* Tool execution log */}
      {showLog && toolLog.length > 0 && (
        <Card className="p-4 mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Agent Tool Execution Log</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {toolLog.map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-terminal-border last:border-0">
                <span className={t.status === 'success' ? 'text-market-green' : 'text-market-red'}>
                  {t.status === 'success' ? '✓' : '✗'}
                </span>
                <span className="text-slate-400 font-mono">{t.toolName}</span>
                <span className="text-slate-600 truncate">{t.inputSummary}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Report list sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Past Briefs</h3>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-600">No briefs generated yet.</p>
            ) : (
              <div className="space-y-1">
                {reports.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                    style={selected?.id === r.id
                      ? { background: 'rgba(61,126,255,0.15)', color: '#93b4ff', border: '1px solid rgba(61,126,255,0.3)' }
                      : { color: '#64748b', border: '1px solid transparent' }}>
                    <div className="font-medium text-slate-300 truncate">{r.title}</div>
                    <div className="text-slate-600 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Report content */}
        <div className="lg:col-span-3">
          {generating ? (
            <Card className="p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-market-blue border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-white mb-1">Generating Morning Brief…</div>
                  <div className="text-xs text-slate-500">Fetching market data, news, and calculating indicators</div>
                </div>
                <div className="w-full max-w-sm space-y-2 mt-2">
                  {['Fetching watchlist quotes', 'Gathering market news', 'Calculating indicators', 'Running AI analysis'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-market-blue animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : selected ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-terminal-border">
                <div>
                  <div className="text-xs text-slate-500">{new Date(selected.createdAt).toLocaleString()}</div>
                  {selected.symbols.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {selected.symbols.map(s => (
                        <span key={s} className="text-[10px] font-mono badge-blue px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                {selected.sources.length > 0 && (
                  <div className="text-xs text-slate-600">{selected.sources.length} sources</div>
                )}
              </div>
              <MarkdownViewer content={selected.content} />
              {selected.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-terminal-border">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sources</div>
                  <div className="space-y-1">
                    {selected.sources.slice(0, 8).map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-market-blue transition-colors">
                        <span className="text-market-blue shrink-0">↗</span>
                        <span className="truncate">{s.title}</span>
                        <span className="text-slate-700 shrink-0">— {s.publisher}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="☀"
                title="No Morning Brief Yet"
                description="Click 'Generate Brief' to create your first AI-powered morning market intelligence report."
                action={<Button onClick={generate}>Generate Morning Brief</Button>}
              />
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
