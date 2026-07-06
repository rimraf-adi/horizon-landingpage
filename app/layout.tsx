import React from "react"
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prop Trading Cockpit | Session, Behavior & Multi-Account Analytics',
  description: 'Trader-centric analytics cockpit for prop firm and broker data. Turn executions into session intelligence, behavioral pattern detection, and multi-account capital allocation insights.',
  icons: {
    icon: '/assets/chart-line.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
