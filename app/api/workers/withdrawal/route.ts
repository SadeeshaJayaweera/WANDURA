import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'WORKER') {
      return NextResponse.json({ error: 'Unauthorized: Worker account required' }, { status: 403 })
    }

    const body = await req.json()
    const { amount, bankName, accountNumber, accountHolder, branch } = body

    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Valid withdrawal amount is required' }, { status: 400 })
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 })
    }

    if (workerProfile.walletBalance < withdrawAmount) {
      return NextResponse.json({
        error: `Insufficient wallet balance. Available: Rs. ${workerProfile.walletBalance.toLocaleString()}`,
      }, { status: 400 })
    }

    // Deduct from wallet balance
    const updatedProfile = await prisma.workerProfile.update({
      where: { userId: session.user.id },
      data: {
        walletBalance: { decrement: withdrawAmount },
      },
    })

    // Create withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'WITHDRAWAL',
        amount: -withdrawAmount,
        status: 'COMPLETED',
        description: `Payout to ${bankName || 'Bank'} (Acc: ${accountNumber || 'Primary'}) - Branch: ${branch || 'Local'}`,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'WITHDRAWAL_COMPLETED',
        title: 'Payout Processed (මුදල් ලබාගැනීම)',
        message: `Your withdrawal of Rs. ${withdrawAmount.toLocaleString()} to ${bankName || 'Bank'} has been approved and credited.`,
        link: '/dashboard/earnings',
      },
    })

    return NextResponse.json({
      success: true,
      walletBalance: updatedProfile.walletBalance,
      transaction,
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
  }
}
