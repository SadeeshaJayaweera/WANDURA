import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const skill = searchParams.get('skill')
    const city = searchParams.get('city')
    const minRate = searchParams.get('minRate')
    const maxRate = searchParams.get('maxRate')
    const minRating = searchParams.get('minRating')
    const isAvailable = searchParams.get('isAvailable')

    const where: any = {}

    if (skill) where.skill = skill
    if (city) where.city = city
    if (isAvailable === 'true') where.isAvailable = true
    if (minRate || maxRate) {
      where.dailyRate = {}
      if (minRate) where.dailyRate.gte = parseFloat(minRate)
      if (maxRate) where.dailyRate.lte = parseFloat(maxRate)
    }
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) }
    }

    const workers = await prisma.workerProfile.findMany({
      where,
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
      orderBy: { rating: 'desc' },
    })

    return NextResponse.json(workers)
  } catch (error) {
    console.error('Workers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const profile = await prisma.workerProfile.create({
      data: {
        userId: session.user.id,
        skill: body.skill,
        dailyRate: body.dailyRate,
        hourlyRate: body.hourlyRate,
        experience: body.experience,
        bio: body.bio,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Worker profile create error:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}
