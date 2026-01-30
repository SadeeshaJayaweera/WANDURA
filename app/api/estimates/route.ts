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

    const estimate = await prisma.estimate.create({
      data: {
        userId: session.user.id,
        name: body.name,
        description: body.description,
        items: body.items,
        totalCost: body.totalCost,
        projectId: body.projectId,
      },
    })

    return NextResponse.json(estimate, { status: 201 })
  } catch (error) {
    console.error('Estimate create error:', error)
    return NextResponse.json({ error: 'Failed to create estimate' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const estimates = await prisma.estimate.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(estimates)
  } catch (error) {
    console.error('Estimates fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 })
  }
}
