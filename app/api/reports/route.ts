import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (id) {
    const report = await db.getReport(id)
    if (!report) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: report })
  }

  const reports = await db.getReports(type ?? undefined)

  return NextResponse.json({ success: true, data: reports })
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ success: false, error: 'Not implemented in MVP' }, { status: 501 })
}
