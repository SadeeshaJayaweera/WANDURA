import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Find by either userId or workerProfile id
    const worker = await prisma.workerProfile.findFirst({
      where: {
        OR: [
          { userId: params.id },
          { id: params.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        skillTags: true,
      },
    })

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Get reviews using worker.userId
    const reviews = await prisma.review.findMany({
      where: { recipientId: worker.userId },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    })

    return NextResponse.json({ worker, reviews })
  } catch (error) {
    console.error('Worker fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worker' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const worker = await prisma.workerProfile.findFirst({
      where: {
        OR: [
          { userId: params.id },
          { id: params.id },
        ],
      },
    })

    if (!worker) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 })
    }

    // Must be the owner worker or admin
    if (session.user.id !== worker.userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      phone,
      skill,
      dailyRate,
      hourlyRate,
      experience,
      bio,
      city,
      address,
      state,
      zipCode,
      isAvailable,
    } = body

    // Update User record if name or phone changed
    if (name || phone) {
      await prisma.user.update({
        where: { id: worker.userId },
        data: {
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
        },
      })
    }

    // Update WorkerProfile record
    const updatedWorker = await prisma.workerProfile.update({
      where: { id: worker.id },
      data: {
        ...(skill ? { skill } : {}),
        ...(typeof dailyRate === 'number' ? { dailyRate } : {}),
        ...(typeof hourlyRate === 'number' ? { hourlyRate } : {}),
        ...(typeof experience === 'number' ? { experience } : {}),
        ...(typeof bio === 'string' ? { bio } : {}),
        ...(typeof city === 'string' ? { city } : {}),
        ...(typeof address === 'string' ? { address } : {}),
        ...(typeof state === 'string' ? { state } : {}),
        ...(typeof zipCode === 'string' ? { zipCode } : {}),
        ...(typeof isAvailable === 'boolean' ? { isAvailable } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, worker: updatedWorker })
  } catch (error) {
    console.error('Worker update error:', error)
    return NextResponse.json({ error: 'Failed to update worker profile' }, { status: 500 })
  }
}
