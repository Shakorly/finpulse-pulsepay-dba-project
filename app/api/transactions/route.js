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
  const type=searchParams.get('type')||''
  const status=searchParams.get('status')||''
  const currency=searchParams.get('currency')||''
  const tenantId=session.tenantId
  const where={ wallet:{ customer:{ tenantId } }, ...(type&&{type}), ...(status&&{status}), ...(currency&&{currency}), ...(search&&{ OR:[{reference:{contains:search}},{description:{contains:search}},{wallet:{customer:{name:{contains:search}}}}] }) }
  const [transactions,total]=await Promise.all([
    prisma.transaction.findMany({ where, take:limit, skip:(page-1)*limit, orderBy:{createdAt:'desc'}, include:{ wallet:{ include:{ customer:{ select:{name:true} } } } } }),
    prisma.transaction.count({where})
  ])
  return NextResponse.json({ data:transactions.map(t=>({ id:t.id, reference:t.reference.split('-')[0].toUpperCase(), type:t.type, amount:Number(t.amount), currency:t.currency, status:t.status, description:t.description||'—', customer:t.wallet.customer.name, createdAt:t.createdAt })), meta:{ total, page, limit, pages:Math.ceil(total/limit) } })
}
