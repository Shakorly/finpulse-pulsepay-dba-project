import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password)
      return NextResponse.json({ error:'Email and password required' }, { status:400 })

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: true }
    })
    if (!user) return NextResponse.json({ error:'Invalid credentials' }, { status:401 })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error:'Invalid credentials' }, { status:401 })

    const token = signToken({
      id: user.id, email: user.email, name: user.name,
      role: user.role, tenantId: user.tenantId, tenant: user.tenant.slug
    })

    const res = NextResponse.json({
      user: { id:user.id, email:user.email, name:user.name, role:user.role }
    })

    res.cookies.set('fp_token', token, {
      httpOnly: true,
      secure: false,        // HTTP is fine — no HTTPS on this VM
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/'
    })
    return res
  } catch(err) {
    console.error('[login]', err)
    return NextResponse.json({ error:'Server error' }, { status:500 })
  }
}
