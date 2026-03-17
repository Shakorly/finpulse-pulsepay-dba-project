'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
const NAV = [
  { href:'/dashboard',    label:'Dashboard',    icon:'▦' },
  { href:'/transactions', label:'Transactions', icon:'⇄' },
  { href:'/wallets',      label:'Wallets',      icon:'◈' },
  { href:'/customers',    label:'Customers',    icon:'◉' },
]
export default function Sidebar({ user }) {
  const path = usePathname()
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth/logout', { method:'POST' })
    router.push('/login'); router.refresh()
  }
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-ink-900 border-r border-slate-wire/30 flex flex-col z-30">
      <div className="px-5 py-5 border-b border-slate-wire/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-volt/10 border border-volt/30 flex items-center justify-center flex-shrink-0">
            <span className="text-volt font-black font-display text-sm">FP</span>
          </div>
          <div>
            <p className="font-display font-black text-white text-lg leading-none">FinPulse</p>
            <p className="text-slate-ghost text-xs font-mono">v1.0 · MySQL</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <Link key={item.href} href={item.href} className={`sidebar-link ${path.startsWith(item.href)?'active':''}`}>
            <span className="text-base w-5 text-center font-display">{item.icon}</span>
            <span className="font-display font-bold tracking-wide">{item.label}</span>
          </Link>
        ))}
        <div className="mt-4 pt-4 border-t border-slate-wire/30">
          <div className="px-4 py-2 rounded-lg bg-ink-700/40">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-volt animate-pulse"></span>
              <span className="text-xs font-bold text-volt font-display tracking-wide">DATABASE LIVE</span>
            </div>
            <p className="text-xs text-slate-ghost font-mono">MySQL 8 · Prisma ORM</p>
          </div>
        </div>
      </nav>
      <div className="p-3 border-t border-slate-wire/30">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-ink-700/40 mb-2">
          <div className="w-7 h-7 rounded-full bg-plasma/20 border border-plasma/30 flex items-center justify-center flex-shrink-0">
            <span className="text-plasma text-xs font-bold font-display">{user?.name?.charAt(0)??'U'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate font-display leading-none">{user?.name}</p>
            <p className="text-xs text-plasma font-mono mt-0.5">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-ghost hover:text-rose hover:bg-rose/10 transition-colors font-display font-bold tracking-wide">
          ⊗ Sign Out
        </button>
      </div>
    </aside>
  )
}
