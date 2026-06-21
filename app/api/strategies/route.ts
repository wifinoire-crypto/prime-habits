import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/local-store'

export async function GET() {
  return NextResponse.json({ success: true, data: db.getStrategies() })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, assetUniverse, timeframe, entryRules, exitRules, stopLoss, takeProfit, positionSizing, feesPercent, slippagePercent } = body

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 })
    }

    const strategy = db.saveStrategy({
      name: name.trim(),
      description,
      assetUniverse: Array.isArray(assetUniverse) ? assetUniverse : (assetUniverse ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
      timeframe: timeframe ?? '1d',
      entryRules: entryRules ?? [],
      exitRules: exitRules ?? [],
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      positionSizing: positionSizing ?? 'fixed',
      feesPercent: feesPercent ? parseFloat(feesPercent) : 0.1,
      slippagePercent: slippagePercent ? parseFloat(slippagePercent) : 0.05,
    })

    return NextResponse.json({ success: true, data: strategy })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
