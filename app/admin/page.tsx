import { redirect } from 'next/navigation'
}
  )
    />
      stats={stats}
      transactions={transactions}
      products={products}
      projects={projects}
      bookings={bookings}
      users={users}
    <AdminDashboard
  return (

  }
    pendingBookings: await prisma.booking.count({ where: { status: 'PENDING' } }),
    }),
      _sum: { amount: true },
      where: { type: 'COMMISSION', status: 'COMPLETED' },
    totalRevenue: await prisma.transaction.aggregate({
    totalProjects: await prisma.project.count(),
    totalBookings: await prisma.booking.count(),
    totalStores: await prisma.storeProfile.count(),
    totalWorkers: await prisma.workerProfile.count(),
    totalUsers: await prisma.user.count(),
  const stats = {

  ])
    }),
      take: 50,
      orderBy: { createdAt: 'desc' },
      },
        user: { select: { name: true, email: true } },
      include: {
    prisma.transaction.findMany({
    }),
      take: 50,
      orderBy: { createdAt: 'desc' },
      },
        store: { select: { storeName: true } },
      include: {
    prisma.product.findMany({
    }),
      take: 50,
      orderBy: { createdAt: 'desc' },
      },
        customer: { select: { name: true, email: true } },
      include: {
    prisma.project.findMany({
    }),
      take: 50,
      orderBy: { createdAt: 'desc' },
      },
        worker: { select: { name: true, email: true } },
        customer: { select: { name: true, email: true } },
      include: {
    prisma.booking.findMany({
    }),
      take: 50,
      orderBy: { createdAt: 'desc' },
      },
        storeProfile: true,
        workerProfile: true,
      include: {
    prisma.user.findMany({
  const [users, bookings, projects, products, transactions] = await Promise.all([

  }
    redirect('/dashboard')
  if (!session?.user || session.user.role !== 'ADMIN') {

  const session = await getServerSession(authOptions)
export default async function AdminPage() {

import AdminDashboard from './AdminDashboard'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
