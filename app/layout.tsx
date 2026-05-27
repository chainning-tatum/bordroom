import type { Metadata } from 'next'
import { DM_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'BORDROOM — was this meeting necessary?',
  description: 'Paste your meeting notes. Get an honest verdict. Could\'ve been an email? We\'ll tell you.',
  openGraph: {
    title: 'BORDROOM',
    description: 'Paste your meeting notes. Get an honest verdict.',
    siteName: 'BORDROOM',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
