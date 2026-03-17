import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit  = 15
  const search = searchParams.get('search') || ''
  const type   = searchParams.get('type')   || ''

  try {
    const wallet = await prisma.wallet.findFirst({
      where: { customer: { id: session.id }, status: 'ACTIVE' }
    })
    if (!wallet) return NextResponse.json({ data: [], meta: {} })

    const where = {
      walletId: wallet.id,
      ...(type && { type }),
      ...(search && {
        OR: [
          { reference:   { contains: search } },
          { description: { contains: search } }
        ]
      })
    }

    const [txs, total] = await Promise.all([
      prisma.transaction.findMany({ where, take: limit, skip: (page-1)*limit, orderBy: { createdAt: 'desc' } }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      data: txs.map(t => ({
        id:          t.id,
        reference:   t.reference.split('-')[0].toUpperCase(),
        type:        t.type,
        amount:      Number(t.amount),
        currency:    t.currency,
        status:      t.status,
        description: t.description || '—',
        createdAt:   t.createdAt
      })),
      meta: { total, page, limit, pages: Math.ceil(total/limit) }
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
