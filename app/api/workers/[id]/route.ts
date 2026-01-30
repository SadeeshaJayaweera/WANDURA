import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: params.id },
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

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { recipientId: params.id },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
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
