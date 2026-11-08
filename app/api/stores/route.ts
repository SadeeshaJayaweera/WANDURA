import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const query = searchParams.get('q')

    const where: any = {}
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }
    if (query) {
      where.OR = [
        { storeName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ]
    }

    const stores = await prisma.storeProfile.findMany({
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
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error('Stores fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch hardware stores' }, { status: 500 })
  }
}

