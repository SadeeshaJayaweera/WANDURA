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
    } else if (session.user.role === 'HARDWARE_STORE') {
      const storeProfile = await prisma.storeProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (!storeProfile) {
        return NextResponse.json([])
      }
      where.storeId = storeProfile.id
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 })
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            city: true,
            phone: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 })
    }

    const body = await req.json()
    const {
      storeId,
      items,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZip,
      notes,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
    }

    // Determine target storeId
    let targetStoreId = storeId
    if (!targetStoreId) {
      const firstProduct = await prisma.product.findUnique({
        where: { id: items[0].id || items[0].productId },
        select: { storeId: true },
      })
      targetStoreId = firstProduct?.storeId
    }

    if (!targetStoreId) {
      return NextResponse.json({ error: 'Could not find hardware store for this order' }, { status: 400 })
    }

    // Compute total amount
    let totalAmount = 0
    const orderItemsData = []

    for (const item of items) {
      const prodId = item.id || item.productId
      const qty = Number(item.quantity) || 1
      const price = Number(item.price) || Number(item.unitPrice) || 0
      const subtotal = price * qty
      totalAmount += subtotal

      orderItemsData.push({
        productId: prodId,
        quantity: qty,
        unitPrice: price,
        totalPrice: subtotal,
      })
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`

    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        storeId: targetStoreId,
        orderNumber,
        status: 'PENDING',
        totalAmount,
        paymentStatus: 'COMPLETED',
        deliveryAddress: deliveryAddress || 'Site Delivery Location',
        deliveryCity: deliveryCity || 'Colombo',
        deliveryState: deliveryState || 'Western Province',
        deliveryZip: deliveryZip || '00500',
        notes: notes || 'Delivery via Wandura Partner Hardware Network',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        store: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Create a transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'MATERIAL_PURCHASE',
        amount: -totalAmount,
        status: 'COMPLETED',
        description: `Hardware purchase order #${orderNumber}`,
        orderId: order.id,
      },
    })

    // Notify the hardware store owner
    const store = await prisma.storeProfile.findUnique({
      where: { id: targetStoreId },
    })
    if (store?.userId) {
      await prisma.notification.create({
        data: {
          userId: store.userId,
          type: 'ORDER_PLACED',
          title: 'New Material Order Received',
          message: `Order #${orderNumber} for Rs. ${totalAmount.toLocaleString()} has been placed.`,
          link: '/dashboard/orders',
        },
      })
    }

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
