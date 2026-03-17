'use client'
import { useState } from 'react'
import { fmt } from '@/lib/format'
export default function SendPage() {
  const [form, setForm] = useState({ recipientEmail:'', amount:'', description:'' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  async function handleSend(e) {
    e.preventDefault(); setError(''); setResult(null); setLoading(true)
    try {
      const res = await fetch('/api/send', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, amount: parseFloat(form.amount)}) })
      const d = await res.json()
      if (!res.ok) { setError(d.error); return }
      setResult(d); setForm({ recipientEmail:'', amount:'', description:'' })
    } catch { setError('Network error. Please try again.') } finally { setLoading(false) }
  }
  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Send Money</h1>
        <p className="text-slate-ghost text-sm mt-0.5">Instant transfer to any PulsePay customer</p>
      </div>
      {result && (
        <div className="bg-green/10 border border-green/30 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green text-xl">✓</span>
            <span className="font-semibold text-green">Transfer Successful</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-ghost">Amount</span><span className="font-bold text-white">{fmt.currency(result.amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-ghost">Sent to</span><span className="font-medium text-white">{result.recipient}</span></div>
            <div className="flex justify-between"><span className="text-slate-ghost">Reference</span><span className="font-mono text-pulse font-bold">{result.reference}</span></div>
          </div>
          <p className="text-xs text-slate-ghost mt-3 border-t border-green/20 pt-3">Save your reference number to track this transfer</p>
        </div>
      )}
      <div className="card p-6">
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="label">Recipient Email</label>
            <input type="email" required value={form.recipientEmail}
              onChange={e=>setForm(f=>({...f,recipientEmail:e.target.value}))}
              className="input" placeholder="recipient@example.com"/>
            <p className="text-xs text-slate-ghost mt-1">Enter the PulsePay email of the recipient</p>
          </div>
          <div>
            <label className="label">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-ghost font-mono">$</span>
              <input type="number" required min="0.01" max="100000" step="0.01"
                value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
                className="input pl-7" placeholder="0.00"/>
            </div>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input type="text" value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              className="input" placeholder="Payment for services..."/>
          </div>
          {error && <div className="bg-red/10 border border-red/30 rounded-lg px-3 py-2 text-red text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Processing...
              </span>
            ) : '↗ Send Money'}
          </button>
        </form>
      </div>
      <div className="mt-4 p-4 bg-ink-800/50 border border-slate-wire/30 rounded-xl text-xs text-slate-ghost space-y-1">
        <p>• Transfers are instant and cannot be reversed</p>
        <p>• Maximum $100,000 per transaction</p>
        <p>• Always save your reference number</p>
      </div>
    </div>
  )
}
