'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
const NAV = [
  { href:'/dashboard', label:'Dashboard',  icon:'▦' },
  { href:'/send',      label:'Send Money', icon:'↗' },
  { href:'/history',   label:'History',    icon:'☰' },
  { href:'/profile',   label:'Profile',    icon:'◉' },
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
          <div className="w-8 h-8 rounded-lg bg-pulse/20 border border-pulse/30 flex items-center justify-center flex-shrink-0">
            <span className="text-pulse font-bold text-sm">⚡</span>
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">PulsePay</p>
            <p className="text-slate-ghost text-xs mt-0.5">Send · Receive · Track</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={`nav-link ${path.startsWith(item.href) ? 'active' : ''}`}>
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-wire/30">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-ink-700/40 mb-2">
          <div className="w-7 h-7 rounded-full bg-pulse/20 border border-pulse/30 flex items-center justify-center flex-shrink-0">
            <span className="text-pulse text-xs font-bold">{user?.name?.charAt(0) ?? 'U'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-none">{user?.name}</p>
            <p className="text-xs text-slate-ghost mt-0.5 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-ghost hover:text-red hover:bg-red/10 transition-colors">
          ⊗ Sign Out
        </button>
      </div>
    </aside>
  )
}
