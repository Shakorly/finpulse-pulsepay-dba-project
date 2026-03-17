import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { searchParams } = new URL(req.url)
  const page=Math.max(1,parseInt(searchParams.get('page')||'1'))
  const limit=Math.min(50,parseInt(searchParams.get('limit')||'20'))
  const search=searchParams.get('search')||''
  const status=searchParams.get('status')||''
  const tenantId=session.tenantId
  const where={ customer:{ tenantId }, ...(status&&{status}), ...(search&&{ OR:[{currency:{contains:search.toUpperCase()}},{customer:{name:{contains:search}}}] }) }
  const [wallets,total]=await Promise.all([
    prisma.wallet.findMany({ where, take:limit, skip:(page-1)*limit, orderBy:{balance:'desc'}, include:{ customer:{select:{name:true,kycStatus:true}}, _count:{select:{transactions:true}} } }),
    prisma.wallet.count({where})
  ])
  return NextResponse.json({ data:wallets.map(w=>({ id:w.id, externalId:w.externalId.split('-')[0].toUpperCase(), customer:w.customer.name, kycStatus:w.customer.kycStatus, currency:w.currency, balance:Number(w.balance), status:w.status, txCount:w._count.transactions, createdAt:w.createdAt })), meta:{ total, page, limit, pages:Math.ceil(total/limit) } })
}
