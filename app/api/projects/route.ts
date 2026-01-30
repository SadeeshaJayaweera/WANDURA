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

    const projects = await prisma.project.findMany({
      where: { customerId: session.user.id },
      include: {
        bookings: {
          include: {
            worker: { select: { name: true } },
          },
        },
        tasks: true,
        materials: true,
        _count: {
          select: { bookings: true, tasks: true, materials: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const project = await prisma.project.create({
      data: {
        customerId: session.user.id,
        name: body.name,
        description: body.description,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        budget: body.budget,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Project create error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
