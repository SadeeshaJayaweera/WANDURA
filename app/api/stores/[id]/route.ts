import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
    }

    // Try finding by StoreProfile ID or by User ID
    const store = await prisma.storeProfile.findFirst({
      where: {
        OR: [
          { id },
          { userId: id },
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
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({
      store: {
        id: store.id,
        userId: store.userId,
        storeName: store.storeName,
        description: store.description,
        address: store.address,
        city: store.city,
        state: store.state,
        zipCode: store.zipCode,
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone,
        isVerified: store.isVerified,
        rating: store.rating,
        totalReviews: store.totalReviews,
        user: store.user,
      },
      products: store.products,
    })
  } catch (error) {
    console.error('Store detail fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch store details' }, { status: 500 })
  }
}
