import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only worker can accept/reject
    if (session.user.role === 'WORKER' && booking.workerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
    })

    // Create notification
    const notifType = status === 'ACCEPTED' ? 'BOOKING_ACCEPTED' : 'BOOKING_REJECTED'
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: notifType,
        title: `Booking ${status}`,
        message: `Your booking has been ${status.toLowerCase()}`,
        link: `/dashboard/bookings/${params.id}`,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
