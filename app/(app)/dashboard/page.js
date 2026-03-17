'use client'
import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fmt } from '@/lib/format'
const TYPE_COLORS = { CREDIT:'#00E5A0', DEBIT:'#FF6B35', TRANSFER:'#4A9EFF', FEE:'#FFB800', REFUND:'#9B6EF5' }
const STATUS_COLORS = { COMPLETED:'#00E5A0', PENDING:'#FFB800', FAILED:'#FF4560', REVERSED:'#6B8098' }
const CT = ({active,payload,label}) => {
  if (!active||!payload?.length) return null
  return <div className="bg-ink-800 border border-slate-wire/50 rounded-lg p-3 text-xs font-mono shadow-xl"><p className="text-slate-ghost mb-2">{label}</p>{payload.map(p=><p key={p.name} style={{color:p.color||p.fill}}>{p.name}: {fmt.number(p.value)}</p>)}</div>
}
export default function DashboardPage() {
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [days,setDays]=useState(30)
  useEffect(()=>{ setLoading(true); fetch(`/api/dashboard?days=${days}`).then(r=>r.json()).then(d=>{setData(d);setLoading(false)}).catch(()=>setLoading(false)) },[days])
  if (loading) return <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4"><div className="w-10 h-10 border-2 border-volt/30 border-t-volt rounded-full animate-spin"/><p className="text-slate-ghost text-sm font-mono">Querying MySQL database...</p></div>
  if (!data) return <div className="p-8 text-rose">Failed to load</div>
  const {kpis,txByDay,txByType,txByStatus,recentTx}=data
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display font-black text-2xl text-white tracking-tight">Dashboard</h1><p className="text-slate-ghost text-sm font-mono mt-0.5">Live MySQL data · {days}-day window</p></div>
        <div className="flex items-center gap-2">
          {[7,30,90].map(d=><button key={d} onClick={()=>setDays(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display tracking-wide transition-all ${days===d?'bg-volt/15 text-volt border border-volt/30':'text-slate-ghost border border-slate-wire/30 hover:border-slate-ghost/50'}`}>{d}D</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{label:'Total Volume',val:fmt.compact(kpis.totalVolume),sub:fmt.currency(kpis.totalVolume),color:'#00E5A0'},
          {label:'Transactions',val:fmt.number(kpis.totalTransactions),sub:`avg ${fmt.currency(kpis.avgTxValue)}`,color:'#4A9EFF'},
          {label:'Active Wallets',val:fmt.number(kpis.activeWallets),sub:'all currencies',color:'#FFB800'},
          {label:'Verified Customers',val:fmt.number(kpis.verifiedCustomers),sub:'KYC verified',color:'#9B6EF5'}
        ].map(k=>(
          <div key={k.label} className="card p-5 flex flex-col gap-3">
            <p className="stat-label">{k.label}</p>
            <p className="stat-value font-display" style={{color:k.color}}>{k.val}</p>
            <p className="text-xs text-slate-ghost font-mono">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div><p className="stat-label">Daily Volume</p><p className="text-white font-display font-bold text-lg mt-0.5">Credits &amp; Debits</p></div>
          <div className="flex gap-4 text-xs font-mono"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-volt"></span>Credits</span><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ember"></span>Debits</span></div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={txByDay} margin={{top:4,right:4,left:0,bottom:0}}>
            <defs>
              <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3}/><stop offset="95%" stopColor="#00E5A0" stopOpacity={0}/></linearGradient>
              <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/><stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2E48" vertical={false}/>
            <XAxis dataKey="date" tick={{fill:'#6B8098',fontSize:10,fontFamily:'monospace'}} tickFormatter={v=>v?.slice(5)} tickLine={false} axisLine={false}/>
            <YAxis tick={{fill:'#6B8098',fontSize:10,fontFamily:'monospace'}} tickFormatter={v=>fmt.compact(v)} tickLine={false} axisLine={false} width={52}/>
            <Tooltip content={<CT/>}/>
            <Area type="monotone" dataKey="credits" stroke="#00E5A0" strokeWidth={2} fill="url(#gC)"/>
            <Area type="monotone" dataKey="debits" stroke="#FF6B35" strokeWidth={2} fill="url(#gD)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="stat-label mb-4">By Type</p>
          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={txByType} dataKey="volume" nameKey="type" cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3}>{txByType.map(e=><Cell key={e.type} fill={TYPE_COLORS[e.type]||'#6B8098'} stroke="transparent"/>)}</Pie><Tooltip formatter={(v,n)=>[fmt.compact(v),n]} contentStyle={{background:'#0D1526',border:'1px solid #2A3D55',borderRadius:8,fontSize:11}} labelStyle={{color:'#8FA4B8'}} itemStyle={{color:'#8FA4B8'}}/></PieChart></ResponsiveContainer>
          <div className="space-y-1.5 mt-2">{txByType.map(t=><div key={t.type} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:TYPE_COLORS[t.type]||'#6B8098'}}/><span className="text-slate-ghost font-mono">{t.type}</span></span><span className="text-white font-mono font-medium">{fmt.compact(t.volume)}</span></div>)}</div>
        </div>
        <div className="card p-5">
          <p className="stat-label mb-4">By Status</p>
          <div className="space-y-3">{txByStatus.map(s=>{const tot=txByStatus.reduce((a,b)=>a+b.count,0);const pct=tot>0?(s.count/tot*100).toFixed(1):0;return(<div key={s.status}><div className="flex justify-between text-xs font-mono mb-1.5"><span className="text-slate-ghost">{s.status}</span><span className="text-white font-medium">{fmt.number(s.count)} <span className="text-slate-ghost">({pct}%)</span></span></div><div className="h-1.5 bg-ink-700 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${pct}%`,background:STATUS_COLORS[s.status]||'#6B8098'}}/></div></div>)})}</div>
          <div className="mt-4 pt-4 border-t border-slate-wire/30"><p className="stat-label mb-3">Daily Count</p><ResponsiveContainer width="100%" height={80}><BarChart data={txByDay.slice(-14)} margin={{top:0,right:0,left:0,bottom:0}}><Bar dataKey="tx_count" fill="#4A9EFF" radius={[2,2,0,0]} opacity={0.8}/><Tooltip content={<CT/>}/></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card p-5 flex flex-col gap-3">
          <p className="stat-label">DB Connection</p>
          <p className="text-white font-display font-bold">Live MySQL Stats</p>
          <div className="space-y-2 text-xs font-mono flex-1">{[{l:'Engine',v:'InnoDB MySQL 8'},{l:'ORM',v:'Prisma 5.x'},{l:'Tables',v:'6 relational'},{l:'Records',v:fmt.compact(kpis.totalTransactions*3)+'+ rows'},{l:'Pool',v:'limit=10'},{l:'Encoding',v:'utf8mb4'},{l:'Hosted',v:'Azure VM'},{l:'Status',v:'Connected'}].map(r=><div key={r.l} className="flex gap-2"><span className="text-slate-ghost w-20 flex-shrink-0">{r.l}</span><span className="text-volt/80">{r.v}</span></div>)}</div>
          <div className="pt-3 border-t border-slate-wire/30 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-volt animate-pulse"/><span className="text-xs text-volt font-mono font-bold">Real-time · Live queries</span></div>
        </div>
      </div>
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-wire/30 flex items-center justify-between"><div><p className="stat-label">Latest Transactions</p><p className="text-white font-display font-bold">Recent activity</p></div><a href="/transactions" className="text-xs text-plasma font-mono">View all →</a></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-wire/20">{['Ref','Customer','Type','Amount','Status','Time'].map(h=><th key={h} className="px-4 py-3 text-left stat-label text-xs">{h}</th>)}</tr></thead><tbody>{recentTx.map(tx=><tr key={tx.id} className="table-row"><td className="px-4 py-3 font-mono text-xs text-slate-ghost">{tx.reference}</td><td className="px-4 py-3 text-sm text-white font-medium max-w-32 truncate">{tx.customer}</td><td className="px-4 py-3"><span className="badge text-xs" style={{background:(TYPE_COLORS[tx.type]||'#6B8098')+'20',color:TYPE_COLORS[tx.type]||'#6B8098',border:`1px solid ${(TYPE_COLORS[tx.type]||'#6B8098')}40`}}>{tx.type}</span></td><td className="px-4 py-3 font-mono text-sm font-bold text-white">{fmt.currency(tx.amount,tx.currency)}</td><td className="px-4 py-3"><span className={`badge ${tx.status==='COMPLETED'?'badge-green':tx.status==='PENDING'?'badge-yellow':tx.status==='FAILED'?'badge-red':'badge-gray'}`}>{tx.status}</span></td><td className="px-4 py-3 text-xs text-slate-ghost font-mono">{fmt.dateTime(tx.createdAt)}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  )
}
