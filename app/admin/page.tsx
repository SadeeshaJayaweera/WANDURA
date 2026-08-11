import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [users, bookings, projects, products, transactions] = await Promise.all([
    prisma.user.findMany({
      include: {
        workerProfile: true,
        storeProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.booking.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        worker: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.project.findMany({
      include: {
        customer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.product.findMany({
      include: {
        store: { select: { storeName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.transaction.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const stats = {
    totalUsers: await prisma.user.count(),
    totalWorkers: await prisma.workerProfile.count(),
    totalStores: await prisma.storeProfile.count(),
    totalBookings: await prisma.booking.count(),
    totalProjects: await prisma.project.count(),
    totalRevenue: await prisma.transaction.aggregate({
      where: { type: 'COMMISSION', status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    pendingBookings: await prisma.booking.count({ where: { status: 'PENDING' } }),
  }

  return (
    <AdminDashboard
      users={users}
      bookings={bookings}
      projects={projects}
      products={products}
      transactions={transactions}
      stats={stats}
    />
  )
}
import { redirect } from 'next/navigation'
