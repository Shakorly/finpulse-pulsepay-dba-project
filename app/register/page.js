'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) { setError(d.error); return }
      router.push('/dashboard'); router.refresh()
    } catch { setError('Network error') } finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pulse/20 border border-pulse/40 flex items-center justify-center">
              <span className="text-pulse font-bold text-lg">⚡</span>
            </div>
            <span className="font-bold text-2xl text-white">PulsePay</span>
          </div>
          <p className="text-slate-ghost text-sm">Create your account — takes 30 seconds</p>
        </div>
        <div className="card p-8">
          <h2 className="text-white font-bold text-xl mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Full Name</label><input type="text" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" placeholder="Your full name"/></div>
            <div><label className="label">Email Address</label><input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="input" placeholder="you@example.com"/></div>
            <div><label className="label">Password</label><input type="password" required minLength={8} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="input" placeholder="Min 8 characters"/></div>
            {error && <div className="bg-red/10 border border-red/30 rounded-lg px-3 py-2 text-red text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-ghost mt-6">
            Already have an account? <Link href="/login" className="text-pulse hover:underline">Sign in</Link>
          </p>
        </div>
        <div className="mt-4 p-4 bg-ink-800/60 border border-slate-wire/30 rounded-xl text-xs text-slate-ghost text-center">
          A USD wallet is automatically created when you register.<br/>
          Add funds via FinPulse admin at 172.179.240.231:3000
        </div>
      </div>
    </div>
  )
}
