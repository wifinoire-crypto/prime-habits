import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const watchlistId = searchParams.get('watchlistId') ?? 'default'
  const [assets, watchlists] = await Promise.all([
    db.getWatchedAssets(watchlistId),
    db.getWatchlists(),
  ])
  return NextResponse.json({ success: true, data: { watchlists, assets } })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { symbol, name, assetType, watchlistId = 'default', notes } = body

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ success: false, error: 'symbol is required' }, { status: 400 })
    }

    const asset = await db.addWatchedAsset({
      watchlistId,
      symbol: symbol.toUpperCase().trim(),
      name: name?.trim(),
      assetType: assetType ?? 'stock',
      notes,
    })

    return NextResponse.json({ success: true, data: asset })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
  await db.removeWatchedAsset(id)
  return NextResponse.json({ success: true })
}
