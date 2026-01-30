import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const storeId = searchParams.get('storeId')
    const isAvailable = searchParams.get('isAvailable')

    const where: any = {}

    if (category) where.category = category
    if (storeId) where.storeId = storeId
    if (isAvailable === 'true') where.isAvailable = true

    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            city: true,
            state: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'HARDWARE_STORE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const storeProfile = await prisma.storeProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!storeProfile) {
      return NextResponse.json({ error: 'Store profile not found' }, { status: 404 })
    }

    const product = await prisma.product.create({
      data: {
        storeId: storeProfile.id,
        name: body.name,
        description: body.description,
        category: body.category,
        unit: body.unit,
        price: body.price,
        stock: body.stock,
        images: body.images || [],
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
