import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
export default function Root() {
  const s = getSession()
  if (s) redirect('/dashboard')
  redirect('/login')
}
