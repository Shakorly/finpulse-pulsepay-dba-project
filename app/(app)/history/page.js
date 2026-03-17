'use client'
import { useState, useEffect, useCallback } from 'react'
import { fmt } from '@/lib/format'
export default function HistoryPage() {
  const [data, setData]       = useState({ data:[], meta:{} })
  const [loading, setLoading] = useState(true)
  const [f, setF]             = useState({ search:'', type:'', page:1 })
  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    Object.entries(f).forEach(([k,v]) => { if(v) p.set(k,v) })
    const res = await fetch(`/api/transactions?${p}`)
    setData(await res.json()); setLoading(false)
  }, [f])
  useEffect(() => { load() }, [load])
  const sf = (k,v) => setF(x => ({...x,[k]:v, page: k==='page'?v:1}))
  const { data:txs=[], meta={} } = data
  const typeColor = { CREDIT:'text-green', DEBIT:'text-red', TRANSFER:'text-pulse', FEE:'text-gold', REFUND:'text-gold' }
  const typeSign  = { CREDIT:'+', DEBIT:'-', TRANSFER:'-', FEE:'-', REFUND:'+' }
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-slate-ghost text-sm mt-0.5">Search by reference number or description</p>
      </div>
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Search reference or description..."
          value={f.search} onChange={e=>sf('search',e.target.value)} className="input flex-1 min-w-48"/>
        <select value={f.type} onChange={e=>sf('type',e.target.value)} className="input w-36">
          <option value="">All Types</option>
          <option>CREDIT</option><option>DEBIT</option><option>TRANSFER</option>
          <option>FEE</option><option>REFUND</option>
        </select>
        <span className="text-xs text-slate-ghost font-mono ml-auto">{fmt.number(meta.total||0)} transactions</span>
      </div>
      <div className="card divide-y divide-slate-wire/20">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <div className="w-5 h-5 border-2 border-pulse/30 border-t-pulse rounded-full animate-spin"/>
            <span className="text-slate-ghost text-sm">Loading...</span>
          </div>
        ) : txs.length === 0 ? (
          <p className="py-12 text-center text-slate-ghost text-sm">No transactions found</p>
        ) : txs.map(tx => (
          <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-ink-700/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${tx.type==='CREDIT'?'bg-green/15 text-green':'bg-red/15 text-red'}`}>
                {typeSign[tx.type]}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{tx.description}</p>
                <p className="text-xs text-slate-ghost font-mono mt-0.5">{tx.reference} · {fmt.dateTime(tx.createdAt)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold font-mono ${typeColor[tx.type]||'text-white'}`}>
                {typeSign[tx.type]}{fmt.currency(tx.amount)}
              </p>
              <span className={`text-xs font-bold ${tx.status==='COMPLETED'?'badge-green':tx.status==='PENDING'?'badge-gold':'badge-red'}`}>{tx.status}</span>
            </div>
          </div>
        ))}
        {meta.pages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-ghost font-mono">Page {meta.page} of {meta.pages}</span>
            <div className="flex gap-2">
              <button disabled={meta.page<=1} onClick={()=>sf('page',meta.page-1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
              <button disabled={meta.page>=meta.pages} onClick={()=>sf('page',meta.page+1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
