import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const existing = await prisma.customer.findFirst({ where: { email: email.toLowerCase() } })
    if (existing)
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const tenant = await prisma.tenant.findFirst({ where: { slug: 'acme-fintech' } })
    const hash = await bcrypt.hash(password, 12)

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hash,
        kycStatus: 'PENDING',
        tenantId: tenant.id,
        externalId: email.toLowerCase().replace(/[@.]/g,'_') + '_' + Date.now()
      }
    })

    await prisma.wallet.create({
      data: { customerId: customer.id, currency: 'USD', balance: 0, status: 'ACTIVE' }
    })

    const token = signToken({ id: customer.id, email: customer.email, name: customer.name, tenantId: customer.tenantId })
    const res = NextResponse.json({ success: true, name: customer.name })
    res.cookies.set('pp_token', token, { httpOnly:true, secure:false, sameSite:'lax', maxAge:60*60*8, path:'/' })
    return res
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
