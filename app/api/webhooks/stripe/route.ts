import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, PLATFORM_COMMISSION_RATE } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          // Update booking payment status
          const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'COMPLETED',
              paymentId: paymentIntent.id,
            },
          })

          // Update transaction
          await prisma.transaction.updateMany({
            where: { stripeId: paymentIntent.id },
            data: { status: 'COMPLETED' },
          })

          // Calculate and record commission
          const commission = booking.totalAmount * PLATFORM_COMMISSION_RATE
          const workerEarning = booking.totalAmount - commission

          // Update worker profile earnings and wallet
          await prisma.workerProfile.update({
            where: { userId: booking.workerId },
            data: {
              totalEarnings: { increment: workerEarning },
              walletBalance: { increment: workerEarning },
            },
          })

          // Create commission transaction
          await prisma.transaction.create({
            data: {
              userId: booking.workerId,
              type: 'COMMISSION',
              amount: -commission,
              status: 'COMPLETED',
              description: `Platform commission for booking ${bookingId}`,
              bookingId,
            },
          })

          // Create notifications
          await Promise.all([
            prisma.notification.create({
              data: {
                userId: booking.customerId,
                type: 'PAYMENT_SUCCESS',
                title: 'Payment Successful',
                message: `Your payment of $${booking.totalAmount.toFixed(2)} was successful`,
                link: `/dashboard/bookings/${bookingId}`,
              },
            }),
            prisma.notification.create({
              data: {
                userId: booking.workerId,
                type: 'PAYMENT_SUCCESS',
                title: 'Payment Received',
                message: `You received $${workerEarning.toFixed(2)} for a booking`,
                link: `/dashboard/earnings`,
              },
            }),
          ])
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'FAILED' },
          })

          await prisma.transaction.updateMany({
            where: { stripeId: paymentIntent.id },
            data: { status: 'FAILED' },
          })

          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
          })

          if (booking) {
            await prisma.notification.create({
              data: {
                userId: booking.customerId,
                type: 'PAYMENT_FAILED',
                title: 'Payment Failed',
                message: 'Your payment failed. Please try again.',
                link: `/dashboard/bookings/${bookingId}`,
              },
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
