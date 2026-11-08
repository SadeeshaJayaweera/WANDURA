import { NextRequest, NextResponse } from 'next/server'
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
