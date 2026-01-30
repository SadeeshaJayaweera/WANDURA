import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { recipientId, rating, comment, bookingId } = body

    // Verify the booking exists and user is authorized
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== session.user.id && booking.workerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        authorId: session.user.id,
        recipientId,
        rating,
        comment,
        bookingId,
      },
    })

    // Update worker's average rating if recipient is a worker
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: recipientId },
    })

    if (workerProfile) {
      const reviews = await prisma.review.findMany({
        where: { recipientId },
      })

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

      await prisma.workerProfile.update({
        where: { userId: recipientId },
        data: {
          rating: avgRating,
          totalReviews: reviews.length,
        },
      })
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'REVIEW_RECEIVED',
        title: 'New Review',
        message: `You received a ${rating}-star review`,
        link: `/dashboard/reviews`,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Review create error:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
