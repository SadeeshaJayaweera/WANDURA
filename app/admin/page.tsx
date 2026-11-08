import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [users, bookings, projects, products, transactions, orders] = await Promise.all([
    prisma.user.findMany({
      include: {
        workerProfile: true,
        storeProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.booking.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.project.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.product.findMany({
      include: {
        store: { select: { id: true, storeName: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.transaction.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.order.findMany({
      include: {
        store: { select: { id: true, storeName: true, city: true } },
        items: {
          include: {
            product: { select: { name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  const stats = {
    totalUsers: await prisma.user.count(),
    totalWorkers: await prisma.workerProfile.count(),
    totalStores: await prisma.storeProfile.count(),
    totalBookings: await prisma.booking.count(),
    totalProjects: await prisma.project.count(),
    totalOrders: await prisma.order.count(),
    totalRevenue: await prisma.transaction.aggregate({
      where: { type: 'COMMISSION', status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    pendingBookings: await prisma.booking.count({ where: { status: 'PENDING' } }),
    pendingOrders: await prisma.order.count({ where: { status: 'PENDING' } }),
  }

  return (
    <AdminDashboard
      users={users}
      bookings={bookings}
      projects={projects}
      products={products}
      transactions={transactions}
      orders={orders}
      stats={stats}
    />
  )
}
