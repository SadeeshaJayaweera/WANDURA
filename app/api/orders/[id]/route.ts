import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        store: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Role permission check:
    // Store owner who owns this store can update status
    // Customer who owns this order can CANCEL
    // Admin can update anything
    const isStoreOwner = session.user.role === 'HARDWARE_STORE' && order.store.userId === session.user.id
    const isOrderCustomer = session.user.role === 'CUSTOMER' && order.customerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isStoreOwner && !isAdmin && !(isOrderCustomer && status === 'CANCELLED')) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to update this order' }, { status: 403 })
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        store: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Create notification for customer
    const notifTitle =
      status === 'ACCEPTED'
        ? 'Order Confirmed by Hardware Store'
        : status === 'PROCESSING'
        ? 'Order is Being Packed'
        : status === 'SHIPPED'
        ? 'Materials Dispatched / Out for Delivery'
        : status === 'DELIVERED'
        ? 'Order Delivered Successfully'
        : `Order ${status}`

    await prisma.notification.create({
      data: {
        userId: order.customerId,
        type: status === 'ACCEPTED' ? 'ORDER_ACCEPTED' : status === 'DELIVERED' ? 'ORDER_DELIVERED' : 'ORDER_ACCEPTED',
        title: notifTitle,
        message: `Your material order #${order.orderNumber} status is now ${status}.`,
        link: '/dashboard/orders',
      },
    })

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
