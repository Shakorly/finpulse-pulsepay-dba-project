import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const c = await prisma.customer.findFirst({ where: { id: session.id } })
  return NextResponse.json({ name: c.name, email: c.email, phone: c.phone, kycStatus: c.kycStatus, createdAt: c.createdAt })
}

export async function PATCH(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name, phone, currentPassword, newPassword } = await req.json()
    const customer = await prisma.customer.findFirst({ where: { id: session.id } })
    const updates = {}
    if (name?.trim())  updates.name  = name.trim()
    if (phone?.trim()) updates.phone = phone.trim()
    if (newPassword) {
      if (!currentPassword)
        return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      const valid = await bcrypt.compare(currentPassword, customer.password)
      if (!valid)
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      updates.password = await bcrypt.hash(newPassword, 12)
    }
    await prisma.customer.update({ where: { id: session.id }, data: updates })
    return NextResponse.json({ success: true, message: 'Profile updated' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
