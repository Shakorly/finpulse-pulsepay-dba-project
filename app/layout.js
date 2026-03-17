import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'], display: 'swap' })
export const metadata = { title: 'PulsePay — Send Money Instantly', description: 'Fast secure money transfers' }
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-ink-950 text-slate-soft antialiased`}>{children}</body>
    </html>
  )
}
