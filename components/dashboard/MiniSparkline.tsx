'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Candle } from '@/lib/types'

interface SparklineProps {
  candles: Candle[]
  positive: boolean
}

export default function MiniSparkline({ candles, positive }: SparklineProps) {
  const data = candles.slice(-20).map(c => ({ v: c.close }))
  if (data.length < 2) return null
  const color = positive ? '#00e676' : '#ff4444'
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
