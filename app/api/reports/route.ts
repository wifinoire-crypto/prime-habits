import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/local-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (id) {
    const report = db.getReport(id)
    if (!report) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: report })
  }

  let reports = db.getReports()
  if (type) reports = reports.filter(r => r.reportType === type)

  return NextResponse.json({ success: true, data: reports })
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ success: false, error: 'Not implemented in MVP' }, { status: 501 })
}
