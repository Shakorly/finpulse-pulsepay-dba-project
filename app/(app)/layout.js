import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }) {
  const session = getSession()
  if (!session) redirect('/login')
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#03060C'}}>
      <Sidebar user={session} />
      <main style={{flex:1,marginLeft:'224px',minHeight:'100vh'}}>{children}</main>
    </div>
  )
}
