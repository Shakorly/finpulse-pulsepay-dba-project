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
  const kycStatus=searchParams.get('kycStatus')||''
  const tenantId=session.tenantId
  const where={ tenantId, ...(kycStatus&&{kycStatus}), ...(search&&{ OR:[{name:{contains:search}},{email:{contains:search}}] }) }
  const [customers,total]=await Promise.all([
    prisma.customer.findMany({ where, take:limit, skip:(page-1)*limit, orderBy:{createdAt:'desc'}, include:{ _count:{select:{wallets:true}}, wallets:{select:{balance:true,currency:true,status:true}} } }),
    prisma.customer.count({where})
  ])
  return NextResponse.json({ data:customers.map(c=>({ id:c.id, externalId:c.externalId.split('-')[0].toUpperCase(), name:c.name, email:c.email, kycStatus:c.kycStatus, walletCount:c._count.wallets, totalBalance:c.wallets.reduce((s,w)=>w.status==='ACTIVE'?s+Number(w.balance):s,0), currencies:[...new Set(c.wallets.map(w=>w.currency))], createdAt:c.createdAt })), meta:{ total, page, limit, pages:Math.ceil(total/limit) } })
}
