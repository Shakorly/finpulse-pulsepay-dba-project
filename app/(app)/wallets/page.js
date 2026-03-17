'use client'
import { useState, useEffect, useCallback } from 'react'
import { fmt } from '@/lib/format'
const CC = { USD:'#00E5A0', EUR:'#4A9EFF', GBP:'#9B6EF5', NGN:'#FFB800' }
export default function WalletsPage() {
  const [data,setData]=useState({data:[],meta:{}})
  const [loading,setLoading]=useState(true)
  const [f,setF]=useState({search:'',status:'',page:1})
  const load=useCallback(async()=>{ setLoading(true); const p=new URLSearchParams(); Object.entries(f).forEach(([k,v])=>{if(v)p.set(k,v)}); setData(await(await fetch(`/api/wallets?${p}`)).json()); setLoading(false) },[f])
  useEffect(()=>{load()},[load])
  const sf=(k,v)=>setF(x=>({...x,[k]:v,page:k==='page'?v:1}))
  const {data:wallets=[],meta={}}=data
  const totals=wallets.reduce((a,w)=>{ if(w.status==='ACTIVE') a[w.currency]=(a[w.currency]||0)+w.balance; return a },{})
  return (
    <div className="p-6 space-y-5">
      <div><h1 className="font-display font-black text-2xl text-white tracking-tight">Wallets</h1><p className="text-slate-ghost text-sm font-mono mt-0.5">Multi-currency wallet ledger</p></div>
      {!loading&&Object.keys(totals).length>0&&<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Object.entries(totals).map(([cur,total])=><div key={cur} className="card-sm p-4"><div className="flex items-center gap-2 mb-2"><span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-display" style={{background:(CC[cur]||'#6B8098')+'18',color:CC[cur]||'#6B8098'}}>{cur[0]}</span><span className="stat-label">{cur}</span></div><p className="font-display font-black text-xl text-white">{fmt.compact(total)}</p><p className="text-xs text-slate-ghost font-mono mt-1">{fmt.currency(total,cur)}</p></div>)}</div>}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search customer or currency..." value={f.search} onChange={e=>sf('search',e.target.value)} className="input flex-1 min-w-48"/>
        <select value={f.status} onChange={e=>sf('status',e.target.value)} className="input w-36"><option value="">All Status</option><option>ACTIVE</option><option>FROZEN</option><option>CLOSED</option></select>
        <span className="ml-auto text-xs text-slate-ghost font-mono">{fmt.number(meta.total||0)} wallets</span>
      </div>
      <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-wire/30">{['ID','Customer','KYC','Currency','Balance','Status','Txns','Created'].map(h=><th key={h} className="px-4 py-3 text-left stat-label text-xs whitespace-nowrap">{h}</th>)}</tr></thead>
      <tbody>{loading?<tr><td colSpan={8} className="px-4 py-12 text-center text-slate-ghost font-mono text-sm"><div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-volt/30 border-t-volt rounded-full animate-spin"/>Querying wallets...</div></td></tr>:wallets.map(w=><tr key={w.id} className="table-row"><td className="px-4 py-3 font-mono text-xs text-plasma">{w.externalId}</td><td className="px-4 py-3 text-sm text-white font-medium max-w-36 truncate">{w.customer}</td><td className="px-4 py-3"><span className={`badge ${w.kycStatus==='VERIFIED'?'badge-green':w.kycStatus==='PENDING'?'badge-yellow':'badge-red'}`}>{w.kycStatus}</span></td><td className="px-4 py-3 font-mono font-bold text-sm" style={{color:CC[w.currency]||'#8FA4B8'}}>{w.currency}</td><td className="px-4 py-3 font-mono text-sm font-bold text-white">{fmt.currency(w.balance,w.currency)}</td><td className="px-4 py-3"><span className={`badge ${w.status==='ACTIVE'?'badge-green':w.status==='FROZEN'?'badge-yellow':'badge-gray'}`}>{w.status}</span></td><td className="px-4 py-3 font-mono text-xs text-slate-ghost text-center">{fmt.number(w.txCount)}</td><td className="px-4 py-3 text-xs text-slate-ghost font-mono whitespace-nowrap">{fmt.date(w.createdAt)}</td></tr>)}</tbody></table></div>
      {meta.pages>1&&<div className="px-4 py-3 border-t border-slate-wire/30 flex items-center justify-between"><span className="text-xs text-slate-ghost font-mono">Page {meta.page} of {meta.pages}</span><div className="flex gap-2"><button disabled={meta.page<=1} onClick={()=>sf('page',meta.page-1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button><button disabled={meta.page>=meta.pages} onClick={()=>sf('page',meta.page+1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">Next →</button></div></div>}
      </div>
    </div>
  )
}
