import { Barlow_Condensed, JetBrains_Mono } from 'next/font/google'
import './globals.css'
const barlow = Barlow_Condensed({ subsets:['latin'], variable:'--font-display', weight:['400','700','800','900'], display:'swap' })
const jetbrains = JetBrains_Mono({ subsets:['latin'], variable:'--font-mono', weight:['400','600'], display:'swap' })
export const metadata = { title:'FinPulse — DBA Demo', description:'Next.js + Prisma + MySQL' }
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${barlow.variable} ${jetbrains.variable}`}>
      <body className="bg-ink-950 text-slate-soft antialiased">{children}</body>
    </html>
  )
}
