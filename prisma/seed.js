const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()
const CURRENCIES = ['USD','EUR','GBP','NGN']
const TX_TYPES   = ['CREDIT','DEBIT','TRANSFER','FEE','REFUND']
const DESCS = ['Payment for services','Wallet top-up','Fund transfer','Monthly subscription',
  'Refund processed','API fee','Settlement','Wire transfer','Mobile payment',
  'Merchant payment','Salary disbursement','Utility bill','Invoice payment']
function rand(a,b){return Math.random()*(b-a)+a}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function daysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return d}
async function main(){
  console.log('Seeding FinPulse...')
  const tenant = await prisma.tenant.upsert({
    where:{slug:'acme-fintech'},update:{},
    create:{name:'ACME FinTech Ltd',slug:'acme-fintech',plan:'ENTERPRISE'}})
  const pw = await bcrypt.hash('Admin@123456',12)
  await prisma.user.upsert({where:{email:'admin@acme.com'},update:{},
    create:{email:'admin@acme.com',password:pw,name:'DBA Admin',role:'DBA',tenantId:tenant.id}})
  await prisma.user.upsert({where:{email:'analyst@acme.com'},update:{},
    create:{email:'analyst@acme.com',password:pw,name:'Data Analyst',role:'ANALYST',tenantId:tenant.id}})
  console.log('Users created')
  const names=[['Aisha Bello','aisha.bello@mail.com'],['Emeka Okafor','emeka.okafor@mail.com'],
    ['Fatima Al-Hassan','fatima.h@mail.com'],['Kwame Mensah','kwame.m@mail.com'],
    ['Ngozi Adeyemi','ngozi.a@mail.com'],['Tunde Williams','tunde.w@mail.com'],
    ['Amara Diallo','amara.d@mail.com'],['Chisom Eze','chisom.e@mail.com'],
    ['Musa Ibrahim','musa.i@mail.com'],['Zainab Yusuf','zainab.y@mail.com'],
    ['David Asante','david.a@mail.com'],['Grace Owusu','grace.o@mail.com'],
    ['Hassan Traore','hassan.t@mail.com'],['Ifeoma Nwosu','ifeoma.n@mail.com'],
    ['Jide Bakare','jide.b@mail.com'],['Kemi Adeola','kemi.a@mail.com'],
    ['Lanre Obi','lanre.o@mail.com'],['Miriam Dada','miriam.d@mail.com'],
    ['Nnamdi Okeke','nnamdi.ok@mail.com'],['Oluwaseun Femi','oluwaseun.f@mail.com']]
  const customers=[]
  for(const [name,email] of names){
    const c=await prisma.customer.upsert({
      where:{externalId:email.replace(/[@.]/g,'_')},update:{},
      create:{externalId:email.replace(/[@.]/g,'_'),name,email,
        kycStatus:pick(['VERIFIED','VERIFIED','VERIFIED','PENDING','REJECTED']),tenantId:tenant.id}})
    customers.push(c)}
  console.log(customers.length+' customers created')
  const wallets=[]
  for(const c of customers){
    const n=Math.random()>0.6?2:1;const used=new Set()
    for(let i=0;i<n;i++){
      let cur;do{cur=pick(CURRENCIES)}while(used.has(cur));used.add(cur)
      const w=await prisma.wallet.create({data:{customerId:c.id,currency:cur,
        balance:parseFloat(rand(100,250000).toFixed(4)),
        status:Math.random()>0.1?'ACTIVE':'FROZEN'}})
      wallets.push(w)}}
  console.log(wallets.length+' wallets created')
  let txCount=0
  for(let day=90;day>=0;day--){
    const n=Math.floor(rand(15,80))
    for(let t=0;t<n;t++){
      const w=pick(wallets);const type=pick(TX_TYPES)
      const amount=parseFloat(rand(10,type==='FEE'?50:5000).toFixed(4))
      const ts=new Date(daysAgo(day).getTime()+rand(0,86400000))
      await prisma.transaction.create({data:{walletId:w.id,type,amount,currency:w.currency,
        status:pick(['COMPLETED','COMPLETED','COMPLETED','COMPLETED','PENDING','FAILED']),
        description:pick(DESCS),createdAt:ts,updatedAt:ts}})
      txCount++}}
  console.log(txCount+' transactions created')
  console.log('Seed complete! Login: admin@acme.com / Admin@123456')
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect())
