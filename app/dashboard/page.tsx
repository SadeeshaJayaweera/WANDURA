import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardContent from './DashboardContent'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch dashboard data based on user role
  let dashboardData: any = {}

  if (session.user.role === 'CUSTOMER') {
    const [bookings, projects] = await Promise.all([
      prisma.booking.findMany({
        where: { customerId: session.user.id },
        include: {
          worker: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.project.findMany({
        where: { customerId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    dashboardData = {
      role: 'CUSTOMER',
      stats: {
        totalBookings: await prisma.booking.count({ where: { customerId: session.user.id } }),
        activeProjects: await prisma.project.count({
          where: { customerId: session.user.id, status: 'ACTIVE' }
        }),
        pendingBookings: await prisma.booking.count({
          where: { customerId: session.user.id, status: 'PENDING' }
        }),
      },
      recentBookings: bookings,
      recentProjects: projects,
    }
  } else if (session.user.role === 'WORKER') {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    })

    const bookings = await prisma.booking.findMany({
      where: { workerId: session.user.id },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    dashboardData = {
      role: 'WORKER',
      profile: workerProfile,
      stats: {
        totalEarnings: workerProfile?.totalEarnings || 0,
        completedJobs: workerProfile?.totalJobs || 0,
        averageRating: workerProfile?.rating || 0,
        walletBalance: workerProfile?.walletBalance || 0,
        pendingBookings: await prisma.booking.count({
          where: { workerId: session.user.id, status: 'PENDING' }
        }),
      },
      recentBookings: bookings,
    }
  } else if (session.user.role === 'HARDWARE_STORE') {
    const storeProfile = await prisma.storeProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        products: { take: 5 },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    dashboardData = {
      role: 'HARDWARE_STORE',
      profile: storeProfile,
      stats: {
        totalProducts: await prisma.product.count({
          where: { storeId: storeProfile?.id }
        }),
        totalOrders: await prisma.order.count({
          where: { storeId: storeProfile?.id }
        }),
        pendingOrders: await prisma.order.count({
          where: { storeId: storeProfile?.id, status: 'PENDING' }
        }),
      },
      recentProducts: storeProfile?.products || [],
      recentOrders: storeProfile?.orders || [],
    }
  }

  return <DashboardContent session={session} data={dashboardData} />
}
