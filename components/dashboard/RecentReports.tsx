'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ResearchReport } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const TYPE_LABELS: Record<string, { label: string; color: 'blue' | 'yellow' | 'green' | 'muted' }> = {
  'morning-brief': { label: 'Morning Brief', color: 'blue' },
  'ticker-deep-dive': { label: 'Ticker Research', color: 'green' },
  'strategy-backtest': { label: 'Backtest', color: 'yellow' },
  'weekly-review': { label: 'Weekly Review', color: 'muted' },
}

export default function RecentReports() {
  const [reports, setReports] = useState<ResearchReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(d => {
      if (d.success) setReports(d.data.slice(0, 5))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent Reports</h2>
        <Link href="/reports" className="text-xs text-market-blue hover:underline">View all →</Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="shimmer-bg h-14 rounded-lg" />)}
        </div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">No reports yet. Generate a Morning Brief to get started.</p>
      ) : (
        <div className="space-y-1">
          {reports.map(report => {
            const meta = TYPE_LABELS[report.reportType]
            return (
              <Link key={report.id} href={`/reports?id=${report.id}`}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{report.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{new Date(report.createdAt).toLocaleString()}</div>
                </div>
                {meta && <Badge variant={meta.color}>{meta.label}</Badge>}
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}
