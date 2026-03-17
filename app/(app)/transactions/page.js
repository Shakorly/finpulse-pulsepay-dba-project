'use client'
import { useState, useEffect, useCallback } from 'react'
import { fmt } from '@/lib/format'
const TC = { CREDIT:'#00E5A0', DEBIT:'#FF6B35', TRANSFER:'#4A9EFF', FEE:'#FFB800', REFUND:'#9B6EF5' }
export default function TransactionsPage() {
  const [data,setData]=useState({data:[],meta:{}})
  const [loading,setLoading]=useState(true)
  const [f,setF]=useState({search:'',type:'',status:'',currency:'',page:1})
  const load=useCallback(async()=>{ setLoading(true); const p=new URLSearchParams(); Object.entries(f).forEach(([k,v])=>{if(v)p.set(k,v)}); const res=await fetch(`/api/transactions?${p}`); setData(await res.json()); setLoading(false) },[f])
  useEffect(()=>{load()},[load])
  const sf=(k,v)=>setF(x=>({...x,[k]:v,page:k==='page'?v:1}))
  const {data:txs=[],meta={}}=data
  return (
    <div className="p-6 space-y-5">
      <div><h1 className="font-display font-black text-2xl text-white tracking-tight">Transactions</h1><p className="text-slate-ghost text-sm font-mono mt-0.5">Live MySQL · Paginated · Filterable</p></div>
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search customer, reference..." value={f.search} onChange={e=>sf('search',e.target.value)} className="input flex-1 min-w-48"/>
        <select value={f.type} onChange={e=>sf('type',e.target.value)} className="input w-36"><option value="">All Types</option>{['CREDIT','DEBIT','TRANSFER','FEE','REFUND'].map(o=><option key={o}>{o}</option>)}</select>
        <select value={f.status} onChange={e=>sf('status',e.target.value)} className="input w-36"><option value="">All Status</option>{['COMPLETED','PENDING','FAILED','REVERSED'].map(o=><option key={o}>{o}</option>)}</select>
        <select value={f.currency} onChange={e=>sf('currency',e.target.value)} className="input w-32"><option value="">All FX</option>{['USD','EUR','GBP','NGN'].map(o=><option key={o}>{o}</option>)}</select>
        <button onClick={()=>setF({search:'',type:'',status:'',currency:'',page:1})} className="btn-ghost text-xs">Reset</button>
        <span className="ml-auto text-xs text-slate-ghost font-mono">{fmt.number(meta.total||0)} rows</span>
      </div>
      <div className="card">
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-wire/30">{['#','Ref','Customer','Type','Amount','Currency','Status','Description','Date'].map(h=><th key={h} className="px-4 py-3 text-left stat-label text-xs whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>{loading?<tr><td colSpan={9} className="px-4 py-12 text-center text-slate-ghost font-mono text-sm"><div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-volt/30 border-t-volt rounded-full animate-spin"/>Loading from MySQL...</div></td></tr>:txs.length===0?<tr><td colSpan={9} className="px-4 py-12 text-center text-slate-ghost font-mono text-sm">No transactions found</td></tr>:txs.map((tx,i)=><tr key={tx.id} className="table-row"><td className="px-4 py-3 text-xs text-slate-ghost font-mono">{(meta.page-1)*meta.limit+i+1}</td><td className="px-4 py-3 font-mono text-xs font-bold text-plasma">{tx.reference}</td><td className="px-4 py-3 text-sm text-white max-w-36 truncate">{tx.customer}</td><td className="px-4 py-3"><span className="badge text-xs" style={{background:(TC[tx.type]||'#6B8098')+'18',color:TC[tx.type]||'#6B8098',border:`1px solid ${(TC[tx.type]||'#6B8098')}35`}}>{tx.type}</span></td><td className="px-4 py-3 font-mono text-sm font-bold text-white">{fmt.currency(tx.amount,tx.currency)}</td><td className="px-4 py-3 font-mono text-xs text-slate-ghost">{tx.currency}</td><td className="px-4 py-3"><span className={`badge ${tx.status==='COMPLETED'?'badge-green':tx.status==='PENDING'?'badge-yellow':tx.status==='FAILED'?'badge-red':'badge-gray'}`}>{tx.status}</span></td><td className="px-4 py-3 text-xs text-slate-ghost max-w-40 truncate">{tx.description}</td><td className="px-4 py-3 text-xs text-slate-ghost font-mono whitespace-nowrap">{fmt.dateTime(tx.createdAt)}</td></tr>)}</tbody></table></div>
        {meta.pages>1&&<div className="px-4 py-3 border-t border-slate-wire/30 flex items-center justify-between"><span className="text-xs text-slate-ghost font-mono">Page {meta.page} of {meta.pages}</span><div className="flex gap-2"><button disabled={meta.page<=1} onClick={()=>sf('page',meta.page-1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button><button disabled={meta.page>=meta.pages} onClick={()=>sf('page',meta.page+1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">Next →</button></div></div>}
      </div>
      <div className="card-sm p-4 border-l-2 border-plasma/40"><p className="text-xs text-slate-ghost font-mono"><span className="text-plasma font-bold">Live SQL:</span> SELECT t.* FROM transactions t JOIN wallets w ON t.wallet_id=w.id JOIN customers c ON w.customer_id=c.id WHERE c.tenant_id=?{f.type&&` AND t.type='${f.type}'`}{f.status&&` AND t.status='${f.status}'`}{f.currency&&` AND t.currency='${f.currency}'`} ORDER BY t.created_at DESC LIMIT {meta.limit||20} OFFSET {((meta.page||1)-1)*(meta.limit||20)}</p></div>
    </div>
  )
}
