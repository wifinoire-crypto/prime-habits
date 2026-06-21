'use client'

import { useEffect, useRef, useState } from 'react'

interface TradingViewChartProps {
  symbol: string
  height?: number
}

function toTVSymbol(symbol: string): string {
  const crypto: Record<string, string> = {
    BTC: 'COINBASE:BTCUSD', ETH: 'COINBASE:ETHUSD', SOL: 'COINBASE:SOLUSD',
    BNB: 'BINANCE:BNBUSDT', XRP: 'BINANCE:XRPUSDT', ADA: 'BINANCE:ADAUSDT',
    DOGE: 'BINANCE:DOGEUSDT', AVAX: 'BINANCE:AVAXUSDT',
  }
  return crypto[symbol] ?? symbol
}

export default function TradingViewChart({ symbol, height = 520 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    setLoaded(false)
    container.innerHTML = ''

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.cssText = 'height:100%;width:100%'
    container.appendChild(widgetDiv)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: toTVSymbol(symbol),
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#060d1f',
      gridColor: 'rgba(22,32,64,0.6)',
      enable_publishing: false,
      allow_symbol_change: false,
      hide_side_toolbar: false,
      withdateranges: true,
      hide_volume: false,
      studies: ['STD;RSI', 'STD;MACD'],
      support_host: 'https://www.tradingview.com',
    })
    script.onload = () => setLoaded(true)
    container.appendChild(script)

    return () => { if (container) container.innerHTML = '' }
  }, [symbol])

  return (
    <div className="card overflow-hidden rounded-xl" style={{ height }}>
      {!loaded && (
        <div className="flex items-center justify-center h-full text-slate-500 text-sm gap-2">
          <span className="animate-spin text-market-blue">⟳</span> Loading TradingView chart…
        </div>
      )}
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: '100%', width: '100%', display: loaded ? 'block' : 'none' }}
      />
    </div>
  )
}
