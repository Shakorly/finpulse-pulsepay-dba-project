import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const tenantId = session.tenantId
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '30')
  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    const [totalTx, volumeResult, walletCount, customerCount, txByType, txByStatus, recentTx] =
      await Promise.all([
        prisma.transaction.count({
          where: { createdAt:{gte:since}, wallet:{ customer:{ tenantId } } }
        }),
        prisma.transaction.aggregate({
          _sum: { amount:true },
          where: { status:'COMPLETED', createdAt:{gte:since}, wallet:{ customer:{ tenantId } } }
        }),
        prisma.wallet.count({ where:{ status:'ACTIVE', customer:{ tenantId } } }),
        prisma.customer.count({ where:{ tenantId, kycStatus:'VERIFIED' } }),
        prisma.transaction.groupBy({
          by: ['type'], _count:{id:true}, _sum:{amount:true},
          where: { createdAt:{gte:since}, wallet:{ customer:{ tenantId } } }
        }),
        prisma.transaction.groupBy({
          by: ['status'], _count:{id:true},
          where: { createdAt:{gte:since}, wallet:{ customer:{ tenantId } } }
        }),
        prisma.transaction.findMany({
          take: 8, orderBy:{ createdAt:'desc' },
          where: { wallet:{ customer:{ tenantId } } },
          include: { wallet:{ include:{ customer:{ select:{ name:true } } } } }
        })
      ])

    // Daily chart — plain JS grouping (avoids raw SQL issues)
    const allTx = await prisma.transaction.findMany({
      where: { status:'COMPLETED', createdAt:{gte:since}, wallet:{ customer:{ tenantId } } },
      select: { createdAt:true, amount:true, type:true }
    })

    const dayMap = {}
    for (const t of allTx) {
      const d = t.createdAt.toISOString().split('T')[0]
      if (!dayMap[d]) dayMap[d] = { date:d, tx_count:0, volume:0, credits:0, debits:0 }
      dayMap[d].volume   += Number(t.amount)
      dayMap[d].tx_count += 1
      if (t.type === 'CREDIT') dayMap[d].credits += Number(t.amount)
      if (t.type === 'DEBIT')  dayMap[d].debits  += Number(t.amount)
    }
    const txByDay = Object.values(dayMap).sort((a,b) => a.date.localeCompare(b.date))

    const totalVolume = Number(volumeResult._sum.amount || 0)

    return NextResponse.json({
      kpis: {
        totalTransactions: totalTx,
        totalVolume,
        activeWallets: walletCount,
        verifiedCustomers: customerCount,
        avgTxValue: totalTx > 0 ? totalVolume / totalTx : 0
      },
      txByDay,
      txByType: txByType.map(r => ({ type:r.type, count:r._count.id, volume:Number(r._sum.amount||0) })),
      txByStatus: txByStatus.map(r => ({ status:r.status, count:r._count.id })),
      recentTx: recentTx.map(t => ({
        id: t.id,
        reference: t.reference.split('-')[0].toUpperCase(),
        type: t.type, amount: Number(t.amount), currency: t.currency,
        status: t.status, description: t.description,
        customer: t.wallet.customer.name, createdAt: t.createdAt
      }))
    })
  } catch(err) {
    console.error('[dashboard]', err)
    return NextResponse.json({ error: err.message }, { status:500 })
  }
}
