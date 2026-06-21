import { NewsItem } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h >= 1) return `${h}h ago`
  return `${m}m ago`
}

export default function NewsFeed({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Recent News</h3>
        <p className="text-sm text-slate-500">No news available.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Recent News</h3>
      <div className="space-y-3">
        {news.map((item, i) => (
          <a key={item.id ?? i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-terminal-border">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.title}</h4>
              {item.sentiment && (
                <Badge variant={item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'muted'} className="shrink-0 mt-0.5">
                  {item.sentiment}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.snippet}</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              <span>{item.publisher}</span>
              <span>•</span>
              <span>{timeAgo(item.timestamp)}</span>
            </div>
          </a>
        ))}
      </div>
    </Card>
  )
}
