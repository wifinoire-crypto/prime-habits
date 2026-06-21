import Anthropic from '@anthropic-ai/sdk'
import { Quote, CompanyProfile, NewsItem, IndicatorResult, EarningsEvent } from '@/lib/types'

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

interface TickerResearchInput {
  symbol: string
  quote: Quote
  profile: CompanyProfile
  indicators: IndicatorResult
  news: NewsItem[]
  earnings: EarningsEvent[]
}

export async function generateTickerResearch(input: TickerResearchInput): Promise<string> {
  if (!client) {
    return generateTemplateResearch(input)
  }

  const { symbol, quote, profile, indicators, news, earnings } = input

  const prompt = `You are a professional equity research analyst. Generate a comprehensive research note for ${symbol}.

COMPANY: ${profile.name} | ${profile.sector} | ${profile.industry}
DESCRIPTION: ${profile.description?.slice(0, 300)}

PRICE DATA:
- Current: $${quote.price} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}% today)
- Previous Close: $${quote.previousClose}
- Day Range: $${quote.low}–$${quote.high}
- Volume: ${(quote.volume / 1e6).toFixed(1)}M

TECHNICAL INDICATORS:
- RSI(14): ${indicators.rsi14 ?? 'N/A'}
- MACD: ${indicators.macd ? `${indicators.macd.macd.toFixed(3)} / Signal: ${indicators.macd.signal.toFixed(3)} / Hist: ${indicators.macd.histogram.toFixed(3)}` : 'N/A'}
- EMA(20): $${indicators.ema20 ?? 'N/A'} | EMA(50): $${indicators.ema50 ?? 'N/A'}
- SMA(200): $${indicators.sma200 ?? 'N/A'}
- Bollinger Bands: ${indicators.bollingerBands ? `Upper $${indicators.bollingerBands.upper} / Lower $${indicators.bollingerBands.lower}` : 'N/A'}
- ATR(14): $${indicators.atr14 ?? 'N/A'}
- 52-Week High: $${indicators.weekHigh52 ?? 'N/A'} (${indicators.distanceFrom52wHigh?.toFixed(1) ?? 'N/A'}% from high)
- 52-Week Low: $${indicators.weekLow52 ?? 'N/A'} (${indicators.distanceFrom52wLow?.toFixed(1) ?? 'N/A'}% from low)
- Relative Volume: ${indicators.relativeVolume?.toFixed(2) ?? 'N/A'}x

RECENT NEWS:
${news.slice(0, 5).map(n => `• [${n.publisher}] ${n.title}\n  ${n.snippet.slice(0, 150)}`).join('\n')}

EARNINGS:
${earnings.length > 0 ? earnings.slice(0, 3).map(e => `• ${e.date}: EPS Est $${e.epsEstimate ?? 'N/A'} | Actual $${e.epsActual ?? 'TBD'}`).join('\n') : 'No upcoming earnings data'}

Generate a research note in Markdown:

# ${symbol} Research Note

## Summary
One paragraph executive summary.

## Technical Picture
Current technical setup, trend, key levels, momentum signals.

## Bull Case
3 specific reasons to be long. Use data.

## Bear Case
3 specific risks or reasons for caution. Be honest.

## Key Risks
Macro, execution, competitive, regulatory risks specific to this company.

## Key Levels
Support, resistance, stop-loss, and target levels.

## Verdict
Balanced assessment. Do NOT give a formal buy/sell rating. Describe the setup and what would change your view.

---
*Analysis as of ${new Date().toISOString()} | For research purposes only. Not financial advice.*`

  try {
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    })
    return (message.content[0] as { type: string; text: string }).text ?? generateTemplateResearch(input)
  } catch (err) {
    console.error('Anthropic API error:', err)
    return generateTemplateResearch(input)
  }
}

function generateTemplateResearch(input: TickerResearchInput): string {
  const { symbol, quote, profile, indicators, news, earnings } = input
  const rsiSignal = indicators.rsi14
    ? indicators.rsi14 > 70 ? '⚠️ Overbought' : indicators.rsi14 < 30 ? '⚡ Oversold' : '✅ Neutral'
    : 'N/A'
  const trendSignal = indicators.ema20 && indicators.ema50
    ? indicators.ema20 > indicators.ema50 ? '📈 Uptrend (EMA20 > EMA50)' : '📉 Downtrend (EMA20 < EMA50)'
    : 'N/A'

  return `# ${symbol} — ${profile.name} Research Note

## Summary

**${profile.name}** (${symbol}) trades at **$${quote.price.toFixed(2)}**, ${quote.changePercent > 0 ? `up **+${quote.changePercent.toFixed(2)}%**` : `down **${quote.changePercent.toFixed(2)}%**`} today. The company operates in the **${profile.sector}** sector (${profile.industry}). ${profile.description?.slice(0, 200) ?? ''}

---

## Technical Picture

| Indicator | Value | Signal |
|-----------|-------|--------|
| Price | $${quote.price.toFixed(2)} | — |
| RSI(14) | ${indicators.rsi14?.toFixed(1) ?? 'N/A'} | ${rsiSignal} |
| Trend | — | ${trendSignal} |
| EMA(20) | $${indicators.ema20?.toFixed(2) ?? 'N/A'} | — |
| EMA(50) | $${indicators.ema50?.toFixed(2) ?? 'N/A'} | — |
| SMA(200) | $${indicators.sma200?.toFixed(2) ?? 'N/A'} | ${indicators.sma200 ? quote.price > indicators.sma200 ? '✅ Above' : '⚠️ Below' : 'N/A'} |
| MACD Hist | ${indicators.macd?.histogram.toFixed(4) ?? 'N/A'} | ${indicators.macd ? indicators.macd.histogram > 0 ? '📈 Bullish' : '📉 Bearish' : 'N/A'} |
| ATR(14) | $${indicators.atr14?.toFixed(2) ?? 'N/A'} | — |
| Rel. Volume | ${indicators.relativeVolume?.toFixed(2) ?? 'N/A'}x | — |

**52-Week Range:** $${indicators.weekLow52?.toFixed(2) ?? '—'} – $${indicators.weekHigh52?.toFixed(2) ?? '—'}
*(${indicators.distanceFrom52wHigh?.toFixed(1) ?? '—'}% from 52w high | ${indicators.distanceFrom52wLow?.toFixed(1) ?? '—'}% from 52w low)*

${indicators.bollingerBands ? `**Bollinger Bands:** Upper $${indicators.bollingerBands.upper.toFixed(2)} | Mid $${indicators.bollingerBands.middle.toFixed(2)} | Lower $${indicators.bollingerBands.lower.toFixed(2)} | Bandwidth ${indicators.bollingerBands.bandwidth.toFixed(1)}%` : ''}

---

## Bull Case

1. **Sector Leadership**: ${profile.name} has strong positioning within the ${profile.sector} sector with continued demand drivers.
2. **Technical Momentum**: ${trendSignal} with price above/near key moving averages suggests ongoing institutional support.
3. **Earnings Catalyst**: ${earnings.length > 0 ? `Upcoming earnings (${earnings[0]!.date}) could be a catalyst if the company executes against estimates.` : 'Historical earnings consistency supports valuation premium.'}

## Bear Case

1. **RSI / Momentum Risk**: ${indicators.rsi14 && indicators.rsi14 > 65 ? `RSI at ${indicators.rsi14?.toFixed(1)} indicates elevated momentum that could lead to mean reversion.` : 'Any deterioration in momentum could accelerate selling from technical traders.'}
2. **Macro Sensitivity**: ${profile.sector === 'Technology' ? 'Higher-for-longer rate environment compresses multiples for growth stocks.' : 'Macro headwinds could weigh on sector performance.'}
3. **Execution Risk**: Any guidance cut or miss vs expectations would likely cause outsized downside given current positioning.

---

## Recent News

${news.slice(0, 4).map(n => `### ${n.title}
*${n.publisher} — ${new Date(n.timestamp).toLocaleDateString()}*

${n.snippet.slice(0, 300)}

[Read More](${n.url})`).join('\n\n')}

---

## Upcoming Earnings

${earnings.length > 0
  ? earnings.slice(0, 3).map(e => `- **${e.date}** (${e.quarter ?? ''}) — EPS Est: $${e.epsEstimate?.toFixed(2) ?? 'N/A'}${e.epsActual !== undefined ? ` | Actual: $${e.epsActual.toFixed(2)}` : ''}`).join('\n')
  : 'No upcoming earnings data available.'}

---

*Generated ${new Date().toISOString()} | Mock data (no API keys configured) | For research purposes only. Not financial advice.*`
}
