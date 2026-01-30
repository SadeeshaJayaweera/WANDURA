import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}

    if (session.user.role === 'CUSTOMER') {
      where.customerId = session.user.id
    } else if (session.user.role === 'WORKER') {
      where.workerId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, email: true, phone: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Get worker profile to get rates
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: body.workerId },
    })

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    // Calculate total amount
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const totalAmount = workerProfile.dailyRate * days
    const commission = totalAmount * 0.1 // 10% platform commission

    const booking = await prisma.booking.create({
      data: {
        customerId: session.user.id,
        workerId: body.workerId,
        projectId: body.projectId,
        skill: body.skill,
        startDate,
        endDate,
        totalDays: days,
        ratePerDay: workerProfile.dailyRate,
        totalAmount,
        commission,
        description: body.description,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
      include: {
        worker: { select: { name: true, email: true } },
      },
    })

    // Create notification for worker
    await prisma.notification.create({
      data: {
        userId: body.workerId,
        type: 'BOOKING_CREATED',
        title: 'New Booking Request',
        message: `You have a new booking request for ${days} days`,
        link: `/dashboard/bookings/${booking.id}`,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Booking create error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
