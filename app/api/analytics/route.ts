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
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    let analytics: any = {}

    if (session.user.role === 'WORKER') {
      const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
      })

      const bookings = await prisma.booking.findMany({
        where: {
          workerId: session.user.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      })

      const totalEarnings = bookings
        .filter(b => b.paymentStatus === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalAmount - b.commission), 0)

      const completedJobs = bookings.filter(b => b.status === 'COMPLETED').length

      analytics = {
        totalEarnings,
        completedJobs,
        pendingJobs: bookings.filter(b => b.status === 'PENDING').length,
        activeJobs: bookings.filter(b => b.status === 'IN_PROGRESS').length,
        averageRating: workerProfile?.rating || 0,
        totalReviews: workerProfile?.totalReviews || 0,
        earningsByDate: bookings.reduce((acc: any, booking) => {
          const date = booking.createdAt.toISOString().split('T')[0]
          acc[date] = (acc[date] || 0) + (booking.totalAmount - booking.commission)
          return acc
        }, {}),
      }
    } else if (session.user.role === 'CUSTOMER') {
      const bookings = await prisma.booking.findMany({
        where: {
          customerId: session.user.id,
          createdAt: { gte: startDate },
        },
      })

      const projects = await prisma.project.findMany({
        where: {
          customerId: session.user.id,
          createdAt: { gte: startDate },
        },
      })

      analytics = {
        totalSpent: bookings
          .filter(b => b.paymentStatus === 'COMPLETED')
          .reduce((sum, b) => sum + b.totalAmount, 0),
        totalBookings: bookings.length,
        activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
        completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
        spendingByDate: bookings.reduce((acc: any, booking) => {
          const date = booking.createdAt.toISOString().split('T')[0]
          acc[date] = (acc[date] || 0) + booking.totalAmount
          return acc
        }, {}),
      }
    } else if (session.user.role === 'HARDWARE_STORE') {
      const storeProfile = await prisma.storeProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (storeProfile) {
        const orders = await prisma.order.findMany({
          where: {
            storeId: storeProfile.id,
            createdAt: { gte: startDate },
          },
          include: {
            items: true,
          },
        })

        analytics = {
          totalOrders: orders.length,
          totalRevenue: orders
            .filter(o => o.paymentStatus === 'COMPLETED')
            .reduce((sum, o) => sum + o.totalAmount, 0),
          pendingOrders: orders.filter(o => o.status === 'PENDING').length,
          completedOrders: orders.filter(o => o.status === 'DELIVERED').length,
          revenueByDate: orders.reduce((acc: any, order) => {
            const date = order.createdAt.toISOString().split('T')[0]
            acc[date] = (acc[date] || 0) + order.totalAmount
            return acc
          }, {}),
          topProducts: await getTopProducts(storeProfile.id, startDate),
        }
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

async function getTopProducts(storeId: string, startDate: Date) {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        storeId,
        createdAt: { gte: startDate },
      },
    },
    include: {
      product: {
        select: {
          name: true,
        },
      },
    },
  })

  const productSales = orderItems.reduce((acc: any, item) => {
    const name = item.product.name
    if (!acc[name]) {
      acc[name] = { name, quantity: 0, revenue: 0 }
    }
    acc[name].quantity += item.quantity
    acc[name].revenue += item.totalPrice
    return acc
  }, {})

  return Object.values(productSales)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5)
}
import { NextRequest, NextResponse } from 'next/server'
