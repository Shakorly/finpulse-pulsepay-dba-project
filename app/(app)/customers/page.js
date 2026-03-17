'use client'
import { useState, useEffect, useCallback } from 'react'
import { fmt } from '@/lib/format'
export default function CustomersPage() {
  const [data,setData]=useState({data:[],meta:{}})
  const [loading,setLoading]=useState(true)
  const [f,setF]=useState({search:'',kycStatus:'',page:1})
  const load=useCallback(async()=>{ setLoading(true); const p=new URLSearchParams(); Object.entries(f).forEach(([k,v])=>{if(v)p.set(k,v)}); setData(await(await fetch(`/api/customers?${p}`)).json()); setLoading(false) },[f])
  useEffect(()=>{load()},[load])
  const sf=(k,v)=>setF(x=>({...x,[k]:v,page:k==='page'?v:1}))
  const {data:customers=[],meta={}}=data
  const kc=customers.reduce((a,c)=>{a[c.kycStatus]=(a[c.kycStatus]||0)+1;return a},{})
  return (
    <div className="p-6 space-y-5">
      <div><h1 className="font-display font-black text-2xl text-white tracking-tight">Customers</h1><p className="text-slate-ghost text-sm font-mono mt-0.5">Customer registry · KYC · Multi-wallet balances</p></div>
      {!loading&&<div className="grid grid-cols-3 gap-3">{[{label:'Verified',key:'VERIFIED',color:'#00E5A0'},{label:'Pending',key:'PENDING',color:'#FFB800'},{label:'Rejected',key:'REJECTED',color:'#FF4560'}].map(({label,key,color})=><button key={key} onClick={()=>sf('kycStatus',f.kycStatus===key?'':key)} className={`card-sm p-4 text-left transition-all hover:opacity-80 ${f.kycStatus===key?'ring-1 ring-white/20':''}`}><p className="stat-label">{label}</p><p className="font-display font-black text-2xl mt-1" style={{color}}>{fmt.number(kc[key]||0)}</p><p className="text-xs text-slate-ghost font-mono mt-1">{meta.total>0?fmt.pct(kc[key]||0,meta.total):'—'} of total</p></button>)}</div>}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search name or email..." value={f.search} onChange={e=>sf('search',e.target.value)} className="input flex-1 min-w-48"/>
        <select value={f.kycStatus} onChange={e=>sf('kycStatus',e.target.value)} className="input w-40"><option value="">All KYC</option><option>VERIFIED</option><option>PENDING</option><option>REJECTED</option></select>
        <span className="ml-auto text-xs text-slate-ghost font-mono">{fmt.number(meta.total||0)} customers</span>
      </div>
      <div className="card"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-wire/30">{['ID','Name','Email','KYC','Wallets','Total Balance','Currencies','Joined'].map(h=><th key={h} className="px-4 py-3 text-left stat-label text-xs whitespace-nowrap">{h}</th>)}</tr></thead>
      <tbody>{loading?<tr><td colSpan={8} className="px-4 py-12 text-center text-slate-ghost font-mono text-sm"><div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-volt/30 border-t-volt rounded-full animate-spin"/>Querying customers...</div></td></tr>:customers.map(c=><tr key={c.id} className="table-row"><td className="px-4 py-3 font-mono text-xs text-plasma">{c.externalId}</td><td className="px-4 py-3 text-sm text-white font-semibold">{c.name}</td><td className="px-4 py-3 text-xs text-slate-ghost font-mono">{c.email}</td><td className="px-4 py-3"><span className={`badge ${c.kycStatus==='VERIFIED'?'badge-green':c.kycStatus==='PENDING'?'badge-yellow':'badge-red'}`}>{c.kycStatus}</span></td><td className="px-4 py-3 text-center font-mono text-sm text-white">{c.walletCount}</td><td className="px-4 py-3 font-mono text-sm font-bold text-white">{fmt.currency(c.totalBalance)}</td><td className="px-4 py-3"><div className="flex gap-1 flex-wrap">{c.currencies.map(cur=><span key={cur} className="badge badge-blue text-xs">{cur}</span>)}</div></td><td className="px-4 py-3 text-xs text-slate-ghost font-mono whitespace-nowrap">{fmt.date(c.createdAt)}</td></tr>)}</tbody></table></div>
      {meta.pages>1&&<div className="px-4 py-3 border-t border-slate-wire/30 flex items-center justify-between"><span className="text-xs text-slate-ghost font-mono">Page {meta.page} of {meta.pages}</span><div className="flex gap-2"><button disabled={meta.page<=1} onClick={()=>sf('page',meta.page-1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button><button disabled={meta.page>=meta.pages} onClick={()=>sf('page',meta.page+1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">Next →</button></div></div>}
      </div>
    </div>
  )
}
