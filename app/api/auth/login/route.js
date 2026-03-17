import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    const customer = await prisma.customer.findFirst({ where: { email: email.toLowerCase().trim() } })
    if (!customer || !customer.password)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await bcrypt.compare(password, customer.password)
    if (!valid)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signToken({ id: customer.id, email: customer.email, name: customer.name, tenantId: customer.tenantId })
    const res = NextResponse.json({ success: true, name: customer.name })
    res.cookies.set('pp_token', token, { httpOnly:true, secure:false, sameSite:'lax', maxAge:60*60*8, path:'/' })
    return res
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
