import { NextRequest, NextResponse } from 'next/server'
}
    .slice(0, 5)
    .sort((a: any, b: any) => b.revenue - a.revenue)
  return Object.values(productSales)

  }, {})
    return acc
    acc[name].revenue += item.totalPrice
    acc[name].quantity += item.quantity
    }
      acc[name] = { name, quantity: 0, revenue: 0 }
    if (!acc[name]) {
    const name = item.product.name
  const productSales = orderItems.reduce((acc: any, item) => {

  })
    },
      },
        },
          name: true,
        select: {
      product: {
    include: {
    },
      },
        createdAt: { gte: startDate },
        storeId,
      order: {
    where: {
  const orderItems = await prisma.orderItem.findMany({
async function getTopProducts(storeId: string, startDate: Date) {

}
  }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    console.error('Analytics fetch error:', error)
  } catch (error) {
    return NextResponse.json(analytics)

    }
      }
        }
          topProducts: await getTopProducts(storeProfile.id, startDate),
          }, {}),
            return acc
            acc[date] = (acc[date] || 0) + order.totalAmount
            const date = order.createdAt.toISOString().split('T')[0]
          revenueByDate: orders.reduce((acc: any, order) => {
          completedOrders: orders.filter(o => o.status === 'DELIVERED').length,
          pendingOrders: orders.filter(o => o.status === 'PENDING').length,
            .reduce((sum, o) => sum + o.totalAmount, 0),
            .filter(o => o.paymentStatus === 'COMPLETED')
          totalRevenue: orders
          totalOrders: orders.length,
        analytics = {

        })
          },
            items: true,
          include: {
          },
            createdAt: { gte: startDate },
            storeId: storeProfile.id,
          where: {
        const orders = await prisma.order.findMany({
      if (storeProfile) {

      })
        where: { userId: session.user.id },
      const storeProfile = await prisma.storeProfile.findUnique({
    } else if (session.user.role === 'HARDWARE_STORE') {
      }
        }, {}),
          return acc
          acc[date] = (acc[date] || 0) + booking.totalAmount
          const date = booking.createdAt.toISOString().split('T')[0]
        spendingByDate: bookings.reduce((acc: any, booking) => {
        completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
        activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
        totalBookings: bookings.length,
          .reduce((sum, b) => sum + b.totalAmount, 0),
          .filter(b => b.paymentStatus === 'COMPLETED')
        totalSpent: bookings
      analytics = {

      })
        },
          createdAt: { gte: startDate },
          customerId: session.user.id,
        where: {
      const projects = await prisma.project.findMany({

      })
        },
          createdAt: { gte: startDate },
          customerId: session.user.id,
        where: {
      const bookings = await prisma.booking.findMany({
    } else if (session.user.role === 'CUSTOMER') {
      }
        }, {}),
          return acc
          acc[date] = (acc[date] || 0) + (booking.totalAmount - booking.commission)
          const date = booking.createdAt.toISOString().split('T')[0]
        earningsByDate: bookings.reduce((acc: any, booking) => {
        totalReviews: workerProfile?.totalReviews || 0,
        averageRating: workerProfile?.rating || 0,
        activeJobs: bookings.filter(b => b.status === 'IN_PROGRESS').length,
        pendingJobs: bookings.filter(b => b.status === 'PENDING').length,
        completedJobs,
        totalEarnings,
      analytics = {

      const completedJobs = bookings.filter(b => b.status === 'COMPLETED').length

        .reduce((sum, b) => sum + (b.totalAmount - b.commission), 0)
        .filter(b => b.paymentStatus === 'COMPLETED')
      const totalEarnings = bookings

      })
        orderBy: { createdAt: 'asc' },
        },
          createdAt: { gte: startDate },
          workerId: session.user.id,
        where: {
      const bookings = await prisma.booking.findMany({

      })
        where: { userId: session.user.id },
      const workerProfile = await prisma.workerProfile.findUnique({
    if (session.user.role === 'WORKER') {

    let analytics: any = {}

    startDate.setDate(startDate.getDate() - parseInt(period))
    const startDate = new Date()

    const period = searchParams.get('period') || '30' // days
    const { searchParams } = new URL(req.url)

    }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!session?.user) {
    const session = await getServerSession(authOptions)
  try {
export async function GET(req: NextRequest) {

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
