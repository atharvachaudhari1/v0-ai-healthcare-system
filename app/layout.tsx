import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AccessibilityProvider } from '@/lib/accessibility-context'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'AyuAi - Medical Predictor & Assistant',
  description: 'AI-powered medical intake and appointment management system with voice agent assessment',
  generator: 'AyuAi',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-[#1F2937] bg-[#F3F5F6]`}>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
        <Analytics />
      </body>
    </html>
  )
}
