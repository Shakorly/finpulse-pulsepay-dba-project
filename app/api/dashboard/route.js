import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: session.id },
      include: { wallets: { where: { status: 'ACTIVE' } } }
    })
    const wallet = customer?.wallets[0]
    if (!wallet) return NextResponse.json({ error: 'No wallet found' }, { status: 404 })

    const [recentTx, stats] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.transaction.aggregate({
        where: { walletId: wallet.id, status: 'COMPLETED', type: 'DEBIT' },
        _sum: { amount: true },
        _count: { id: true }
      })
    ])

    return NextResponse.json({
      customer: { name: customer.name, email: customer.email, kycStatus: customer.kycStatus },
      wallet:   { balance: Number(wallet.balance), currency: wallet.currency, status: wallet.status },
      stats:    { totalSent: Number(stats._sum.amount || 0), txCount: stats._count.id },
      recentTx: recentTx.map(t => ({
        id: t.id,
        reference:   t.reference.split('-')[0].toUpperCase(),
        type:        t.type,
        amount:      Number(t.amount),
        currency:    t.currency,
        status:      t.status,
        description: t.description,
        createdAt:   t.createdAt
      }))
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
