import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { recipientEmail, amount, description } = await req.json()
    const amt = parseFloat(amount)

    if (!recipientEmail || !amt || amt <= 0)
      return NextResponse.json({ error: 'Recipient email and valid amount required' }, { status: 400 })
    if (recipientEmail.toLowerCase() === session.email.toLowerCase())
      return NextResponse.json({ error: 'Cannot send money to yourself' }, { status: 400 })
    if (amt > 100000)
      return NextResponse.json({ error: 'Maximum transfer is $100,000 per transaction' }, { status: 400 })

    const sender = await prisma.customer.findFirst({
      where: { id: session.id },
      include: { wallets: { where: { currency: 'USD', status: 'ACTIVE' } } }
    })
    if (!sender?.wallets[0])
      return NextResponse.json({ error: 'No active USD wallet found' }, { status: 400 })

    const senderWallet = sender.wallets[0]
    if (parseFloat(senderWallet.balance) < amt)
      return NextResponse.json({ error: `Insufficient funds. Balance: $${parseFloat(senderWallet.balance).toFixed(2)}` }, { status: 400 })

    const recipient = await prisma.customer.findFirst({
      where: { email: recipientEmail.toLowerCase() },
      include: { wallets: { where: { currency: 'USD', status: 'ACTIVE' } } }
    })
    if (!recipient)
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    if (!recipient.wallets[0])
      return NextResponse.json({ error: 'Recipient has no active USD wallet' }, { status: 400 })

    const recipientWallet = recipient.wallets[0]
    const reference = uuidv4()
    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amt } }
      })
      if (parseFloat(updated.balance) < 0) throw new Error('Insufficient funds')

      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amt } }
      })

      await tx.transaction.create({
        data: {
          reference,
          walletId: senderWallet.id,
          counterWalletId: recipientWallet.id,
          type: 'DEBIT',
          amount: amt,
          currency: 'USD',
          status: 'COMPLETED',
          description: description || `Transfer to ${recipient.name}`,
          createdAt: now
        }
      })

      await tx.transaction.create({
        data: {
          reference: uuidv4(),
          walletId: recipientWallet.id,
          counterWalletId: senderWallet.id,
          type: 'CREDIT',
          amount: amt,
          currency: 'USD',
          status: 'COMPLETED',
          description: `Transfer from ${sender.name}`,
          createdAt: now
        }
      })

      return { reference, amount: amt, recipient: recipient.name }
    })

    return NextResponse.json({
      success: true,
      reference: result.reference.split('-')[0].toUpperCase(),
      amount: result.amount,
      recipient: result.recipient,
      message: `$${amt.toFixed(2)} sent successfully to ${recipient.name}`
    })

  } catch (err) {
    console.error('[send]', err)
    if (err.message === 'Insufficient funds')
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
    return NextResponse.json({ error: 'Transfer failed. Please try again.' }, { status: 500 })
  }
}
