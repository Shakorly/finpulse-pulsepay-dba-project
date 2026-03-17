import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
export default function AppLayout({ children }) {
  const session = getSession()
  if (!session) redirect('/login')
  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar user={session} />
      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  )
}
