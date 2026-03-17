'use client'
import { useState, useEffect } from 'react'
import { fmt } from '@/lib/format'
import Link from 'next/link'
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/dashboard').then(r=>r.json()).then(d=>{setData(d);setLoading(false)}).catch(()=>setLoading(false))
  }, [])
  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-pulse/30 border-t-pulse rounded-full animate-spin"/></div>
  if (!data?.wallet) return <div className="p-8 text-red-400">Failed to load. Please refresh.</div>
  const { customer, wallet, stats, recentTx } = data
  const typeColor = { CREDIT:'text-green', DEBIT:'text-red', TRANSFER:'text-pulse', FEE:'text-gold', REFUND:'text-gold' }
  const typeSign  = { CREDIT:'+', DEBIT:'-', TRANSFER:'-', FEE:'-', REFUND:'+' }
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {customer.name.split(' ')[0]}</h1>
        <p className="text-slate-ghost text-sm mt-0.5">Your PulsePay overview</p>
      </div>
      <div className="bg-gradient-to-br from-pulse/20 to-pulse/5 border border-pulse/30 rounded-2xl p-6">
        <p className="stat-label mb-2">Available Balance</p>
        <p className="text-5xl font-bold text-white mb-1">{fmt.currency(wallet.balance)}</p>
        <p className="text-slate-ghost text-sm">{wallet.currency} Wallet · <span className={wallet.status==='ACTIVE'?'text-green':'text-red'}>{wallet.status}</span></p>
        <div className="mt-4 flex gap-3">
          <Link href="/send" className="btn-primary text-sm px-5 py-2">↗ Send Money</Link>
          <Link href="/history" className="btn-ghost text-sm px-5 py-2">☰ History</Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4"><p className="stat-label">KYC Status</p><p className="text-lg font-bold mt-1 text-white">{customer.kycStatus}</p></div>
        <div className="card p-4"><p className="stat-label">Total Sent</p><p className="text-lg font-bold mt-1 text-white">{fmt.currency(stats.totalSent)}</p></div>
        <div className="card p-4"><p className="stat-label">Transactions</p><p className="text-lg font-bold mt-1 text-white">{fmt.number(stats.txCount)}</p></div>
      </div>
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-wire/30 flex justify-between items-center">
          <p className="font-semibold text-white">Recent Transactions</p>
          <Link href="/history" className="text-xs text-pulse hover:underline">View all →</Link>
        </div>
        <div className="divide-y divide-slate-wire/20">
          {recentTx.length === 0 && (
            <p className="px-5 py-8 text-center text-slate-ghost text-sm">
              No transactions yet. <Link href="/send" className="text-pulse">Send money</Link> to get started.
            </p>
          )}
          {recentTx.map(tx => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-ink-700/30 transition-colors">
              <div>
                <p className="text-sm font-medium text-white">{tx.description}</p>
                <p className="text-xs text-slate-ghost font-mono mt-0.5">{tx.reference} · {fmt.dateTime(tx.createdAt)}</p>
              </div>
              <p className={`font-bold font-mono ${typeColor[tx.type] || 'text-white'}`}>
                {typeSign[tx.type]}{fmt.currency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
