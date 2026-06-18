import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prime Habits — Personal Discipline Cockpit',
  description: 'Track your habits. Build your edge.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
