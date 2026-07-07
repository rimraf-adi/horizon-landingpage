import React from "react"
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trade Audit | Every trade decoded across 10 domains',
  description: 'Upload your prop firm CSV or a single trade. Get institutional-grade analysis on risk, compliance, behavior, and payout-readiness — in seconds, not a spreadsheet.',
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
