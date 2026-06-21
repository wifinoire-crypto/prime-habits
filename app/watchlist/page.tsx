'use client'

import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Button from '@/components/ui/Button'
import WatchlistTable from '@/components/watchlist/WatchlistTable'
import AddTickerModal from '@/components/watchlist/AddTickerModal'

export default function WatchlistPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAdded = () => {
    setShowModal(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <PageLayout
      title="Watchlist"
      subtitle="Track and monitor your selected assets"
      action={<Button onClick={() => setShowModal(true)}>+ Add Ticker</Button>}>

      <WatchlistTable onAdd={() => setShowModal(true)} refreshKey={refreshKey} />

      {showModal && (
        <AddTickerModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
      )}
    </PageLayout>
  )
}
