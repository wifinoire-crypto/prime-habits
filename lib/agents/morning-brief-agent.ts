import Anthropic from '@anthropic-ai/sdk'
import { Quote, NewsItem, IndicatorResult } from '@/lib/types'
import { format } from 'date-fns'

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

interface BriefInput {
  date: string
  watchlistSymbols: string[]
  quotes: Quote[]
  news: NewsItem[]
  indicators: IndicatorResult[]
  marketNews: NewsItem[]
}

export async function generateMorningBrief(input: BriefInput): Promise<string> {
  if (!client) {
    return generateTemplateBrief(input)
  }

  const { date, quotes, news, indicators, marketNews } = input

  const quoteSummary = quotes
    .map(q => `${q.symbol}: $${q.price} (${q.changePercent > 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`)
    .join('\n')

  const indicatorSummary = indicators
    .map(ind => {
      const rsiStr = ind.rsi14 !== null ? `RSI=${ind.rsi14}` : ''
      const macdStr = ind.macd ? `MACD hist=${ind.macd.histogram.toFixed(3)}` : ''
      const volStr = ind.relativeVolume !== null ? `RelVol=${ind.relativeVolume.toFixed(1)}x` : ''
      return `${ind.symbol}: ${[rsiStr, macdStr, volStr].filter(Boolean).join(', ')}`
    })
    .join('\n')

  const newsItems = [...marketNews, ...news]
    .slice(0, 10)
    .map(n => `• [${n.publisher}] ${n.title}\n  ${n.snippet.slice(0, 150)}`)
    .join('\n')

  const prompt = `You are a professional market intelligence analyst preparing a morning brief for a sophisticated trader/investor.

Today's Date: ${date}

WATCHLIST QUOTES:
${quoteSummary}

TECHNICAL INDICATORS:
${indicatorSummary}

RECENT NEWS & CATALYSTS:
${newsItems}

Generate a comprehensive morning brief in Markdown format covering:

# Morning Brief — ${date}

## 1. Market Overview
Summarize current market conditions, overall sentiment, and key themes.

## 2. Watchlist Highlights
For each ticker with notable action, explain the move with context. Bold tickers. Include technical context.

## 3. Key Catalysts
List the top 3-5 news events/catalysts driving markets today. Explain significance.

## 4. Technical Picture
Call out any technically significant setups in the watchlist (oversold/overbought RSI, MACD crossovers, price at key levels).

## 5. Risks to Watch
What could disrupt the current narrative? List macro and stock-specific risks.

## 6. Action Items
Concrete research tasks or monitoring points for the trading day.

---
*Data as of ${date} | This is for research purposes only, not financial advice.*

Keep the brief concise but substantive — around 600-800 words. Use actual data from the provided quotes and indicators. Be specific, not generic.`

  try {
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    return (message.content[0] as { type: string; text: string }).text ?? generateTemplateBrief(input)
  } catch (err) {
    console.error('Anthropic API error:', err)
    return generateTemplateBrief(input)
  }
}

function generateTemplateBrief(input: BriefInput): string {
  const { date, quotes, news, indicators, marketNews } = input
  const gainers = quotes.filter(q => q.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent)
  const losers = quotes.filter(q => q.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent)
  const allNews = [...marketNews, ...news].slice(0, 6)

  const rsiAlerts = indicators
    .filter(ind => ind.rsi14 !== null && (ind.rsi14 > 70 || ind.rsi14 < 30))
    .map(ind => `**${ind.symbol}** RSI=${ind.rsi14} (${ind.rsi14! > 70 ? '⚠️ Overbought' : '⚡ Oversold'})`)

  return `# Morning Brief — ${date}

## 1. Market Overview

Markets are showing ${gainers.length > losers.length ? 'broadly positive' : losers.length > gainers.length ? 'broadly negative' : 'mixed'} action across the watchlist today. ${gainers.length} of ${quotes.length} tracked assets are trading higher.

## 2. Watchlist Highlights

${quotes.map(q => {
  const arrow = q.changePercent > 0 ? '▲' : q.changePercent < 0 ? '▼' : '▬'
  const color = q.changePercent > 0 ? '+' : ''
  return `- **${q.symbol}** $${q.price.toFixed(2)} ${arrow} ${color}${q.changePercent.toFixed(2)}% | Vol: ${(q.volume / 1e6).toFixed(1)}M`
}).join('\n')}

${gainers.length > 0 ? `**Top Performer:** ${gainers[0]!.symbol} +${gainers[0]!.changePercent.toFixed(2)}%` : ''}
${losers.length > 0 ? `**Weakest:** ${losers[0]!.symbol} ${losers[0]!.changePercent.toFixed(2)}%` : ''}

## 3. Key Catalysts

${allNews.slice(0, 5).map(n => `- **[${n.publisher}]** ${n.title}\n  *${n.snippet.slice(0, 120)}...*`).join('\n\n')}

## 4. Technical Picture

${rsiAlerts.length > 0 ? rsiAlerts.join('\n') : 'No extreme RSI readings in the watchlist at this time.'}

${indicators.filter(ind => ind.macd?.histogram !== undefined).slice(0, 3).map(ind => {
  const hist = ind.macd!.histogram
  return `**${ind.symbol}** MACD histogram: ${hist > 0 ? '▲' : '▼'} ${hist.toFixed(3)} (${hist > 0 ? 'Bullish momentum' : 'Bearish momentum'})`
}).join('\n')}

## 5. Risks to Watch

- Monitor macro data releases and Fed commentary for rate outlook shifts
- Watch for elevated volatility if VIX moves above 20
- Earnings season surprises can cause outsized moves in individual names
- Geopolitical developments impacting energy and risk appetite

## 6. Action Items

- [ ] Review positions with RSI >70 for potential trim levels
- [ ] Check upcoming earnings dates for watchlist names
- [ ] Monitor news flow through the session for catalysts
- [ ] Set alerts on key technical levels for high-conviction ideas

---
*Generated ${new Date().toISOString()} | Mock data (no API keys configured) | For research purposes only.*`
}
