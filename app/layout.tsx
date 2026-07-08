import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { initBlog } from '@/lib/init-blog'
import { FinanceHeader } from '@/components/finance-header'
import { FinanceFooter } from '@/components/finance-footer'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Initialize the blog system
initBlog({
  owner: 'your-github-username',
  repo: 'your-repo-name',
  branch: 'main',
  blogsPath: 'public',
  useLocalFS: true,
});

export const metadata: Metadata = {
  title: 'Paisanomics | Financial Markets & Analysis',
  description: 'Your trusted source for financial market analysis, investment strategies, and economic insights.',
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/nicepic.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/nicepic.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/nicepic.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/nicepic.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen flex flex-col finance-grid relative`}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(11,121,255,0.16),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(0,177,138,0.13),transparent_40%)] pointer-events-none" />
        <FinanceHeader />
        <div className="pt-20 flex-1 relative z-10">
          {children}
        </div>
        <FinanceFooter />
        <Analytics />
      </body>
    </html>
  )
}
