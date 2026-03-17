'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error||'Login failed'); return }
      router.push('/dashboard'); router.refresh()
    } catch { setError('Network error') } finally { setLoading(false) }
  }
  return (
    <div style={{minHeight:'100vh',background:'#03060C',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',fontFamily:'sans-serif'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(0,229,160,0.1)',border:'1px solid rgba(0,229,160,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'900',color:'#00E5A0',fontSize:'16px'}}>FP</div>
            <span style={{fontWeight:'900',fontSize:'28px',color:'white',letterSpacing:'-0.02em'}}>FinPulse</span>
          </div>
          <p style={{color:'#6B8098',fontSize:'14px'}}>Next.js · Prisma · MySQL · Azure</p>
        </div>
        <div style={{background:'#0D1526',border:'1px solid rgba(42,61,85,0.6)',borderRadius:'12px',padding:'2rem'}}>
          <h2 style={{color:'white',fontWeight:'700',fontSize:'20px',marginBottom:'1.5rem'}}>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'11px',fontWeight:'700',letterSpacing:'0.1em',color:'#6B8098',textTransform:'uppercase',marginBottom:'6px'}}>Email</label>
              <input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                style={{width:'100%',background:'#162035',border:'1px solid rgba(42,61,85,0.5)',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#8FA4B8',outline:'none'}}
                placeholder="admin@acme.com"/>
            </div>
            <div style={{marginBottom:'1.5rem'}}>
              <label style={{display:'block',fontSize:'11px',fontWeight:'700',letterSpacing:'0.1em',color:'#6B8098',textTransform:'uppercase',marginBottom:'6px'}}>Password</label>
              <input type="password" required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                style={{width:'100%',background:'#162035',border:'1px solid rgba(42,61,85,0.5)',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#8FA4B8',outline:'none'}}
                placeholder="••••••••"/>
            </div>
            {error && <div style={{background:'rgba(255,69,96,0.1)',border:'1px solid rgba(255,69,96,0.3)',borderRadius:'8px',padding:'10px 12px',color:'#FF4560',fontSize:'13px',marginBottom:'1rem'}}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',background:'#00E5A0',color:'#03060C',fontWeight:'700',fontSize:'14px',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer'}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div style={{marginTop:'1.5rem',padding:'1rem',background:'rgba(22,32,53,0.6)',border:'1px solid rgba(42,61,85,0.3)',borderRadius:'8px'}}>
            <p style={{fontSize:'11px',fontWeight:'700',letterSpacing:'0.1em',color:'#6B8098',textTransform:'uppercase',marginBottom:'10px'}}>Demo Credentials</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              {[{role:'DBA',email:'admin@acme.com'},{role:'Analyst',email:'analyst@acme.com'}].map(u=>(
                <button key={u.email} type="button" onClick={()=>setForm({email:u.email,password:'Admin@123456'})}
                  style={{textAlign:'left',padding:'8px',borderRadius:'8px',background:'#0D1526',border:'1px solid rgba(42,61,85,0.4)',cursor:'pointer'}}>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#4A9EFF',margin:0}}>{u.role}</p>
                  <p style={{fontSize:'11px',color:'#6B8098',fontFamily:'monospace',margin:'2px 0 0'}}>{u.email}</p>
                </button>
              ))}
            </div>
            <p style={{fontSize:'11px',color:'#6B8098',fontFamily:'monospace',textAlign:'center',marginTop:'8px'}}>password: Admin@123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
