'use client'
import { useState, useEffect } from 'react'
import { fmt } from '@/lib/format'
export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [form, setForm]       = useState({ name:'', phone:'' })
  const [pwForm, setPwForm]   = useState({ currentPassword:'', newPassword:'' })
  const [msg, setMsg]         = useState('')
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    fetch('/api/profile').then(r=>r.json()).then(d => {
      setProfile(d); setForm({ name:d.name, phone:d.phone||'' })
    })
  }, [])
  async function saveProfile(e) {
    e.preventDefault(); setMsg(''); setErr(''); setLoading(true)
    try {
      const res = await fetch('/api/profile', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) { setErr(d.error); return }
      setMsg('Profile updated successfully')
      setProfile(p => ({...p, ...form}))
    } catch { setErr('Network error') } finally { setLoading(false) }
  }
  async function changePassword(e) {
    e.preventDefault(); setMsg(''); setErr(''); setLoading(true)
    try {
      const res = await fetch('/api/profile', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(pwForm) })
      const d = await res.json()
      if (!res.ok) { setErr(d.error); return }
      setMsg('Password changed successfully')
      setPwForm({ currentPassword:'', newPassword:'' })
    } catch { setErr('Network error') } finally { setLoading(false) }
  }
  if (!profile) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-pulse/30 border-t-pulse rounded-full animate-spin"/></div>
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-ghost text-sm mt-0.5">Manage your account details</p>
      </div>
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-white border-b border-slate-wire/30 pb-3">Account Information</h3>
        {[
          { label:'Member since', val: fmt.date(profile.createdAt) },
          { label:'KYC Status',   val: profile.kycStatus },
          { label:'Email',        val: profile.email }
        ].map(r => (
          <div key={r.label} className="flex justify-between text-sm">
            <span className="text-slate-ghost">{r.label}</span>
            <span className={`font-medium ${r.label==='KYC Status'?(profile.kycStatus==='VERIFIED'?'text-green':profile.kycStatus==='PENDING'?'text-gold':'text-red'):'text-white'}`}>{r.val}</span>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4 border-b border-slate-wire/30 pb-3">Edit Profile</h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div><label className="label">Full Name</label><input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input"/></div>
          <div><label className="label">Phone Number</label><input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="input" placeholder="+234 800 000 0000"/></div>
          <button type="submit" disabled={loading} className="btn-primary px-6">Save Changes</button>
        </form>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4 border-b border-slate-wire/30 pb-3">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <div><label className="label">Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e=>setPwForm(f=>({...f,currentPassword:e.target.value}))} className="input" required/></div>
          <div><label className="label">New Password</label><input type="password" value={pwForm.newPassword} onChange={e=>setPwForm(f=>({...f,newPassword:e.target.value}))} className="input" minLength={8} required/></div>
          <button type="submit" disabled={loading} className="btn-primary px-6">Change Password</button>
        </form>
      </div>
      {msg && <div className="bg-green/10 border border-green/30 rounded-lg px-4 py-3 text-green text-sm">{msg}</div>}
      {err && <div className="bg-red/10 border border-red/30 rounded-lg px-4 py-3 text-red text-sm">{err}</div>}
    </div>
  )
}
