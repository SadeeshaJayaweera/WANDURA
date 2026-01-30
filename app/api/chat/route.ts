import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get chat messages for a booking
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== session.user.id && booking.workerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get messages (we'll need to add Message model to Prisma)
    // For now, return empty array
    return NextResponse.json([])
  } catch (error) {
    console.error('Chat fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// Send a chat message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bookingId, message } = body

    if (!bookingId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== session.user.id && booking.workerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create notification for the other user
    const recipientId = booking.customerId === session.user.id ? booking.workerId : booking.customerId

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'BOOKING_CREATED', // We can add a MESSAGE type later
        title: 'New Message',
        message: `You have a new message regarding your booking`,
        link: `/dashboard/bookings/${bookingId}`,
      },
    })

    return NextResponse.json({ success: true, message: 'Message sent' })
  } catch (error) {
    console.error('Chat send error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
