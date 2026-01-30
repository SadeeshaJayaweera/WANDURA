'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Hammer,
  LayoutDashboard,
  Users,
  Calendar,
  FolderKanban,
  ShoppingBag,
  LogOut,
  Wallet,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardContent({ session, data }: any) {
  const isCustomer = data.role === 'CUSTOMER'
  const isWorker = data.role === 'WORKER'
  const isStore = data.role === 'HARDWARE_STORE'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Hammer className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Wandura</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {isCustomer && (
              <>
                <Link
                  href="/workers"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Users className="h-4 w-4" />
                  Find Workers
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FolderKanban className="h-4 w-4" />
                  Projects
                </Link>
                <Link
                  href="/estimator"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <TrendingUp className="h-4 w-4" />
                  Cost Estimator
                </Link>
              </>
            )}

            {isWorker && (
              <>
                <Link
                  href="/dashboard/bookings"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Calendar className="h-4 w-4" />
                  Bookings
                </Link>
                <Link
                  href="/dashboard/earnings"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Wallet className="h-4 w-4" />
                  Earnings
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Users className="h-4 w-4" />
                  My Profile
                </Link>
              </>
            )}

            {isStore && (
              <>
                <Link
                  href="/dashboard/products"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Products
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Calendar className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {isCustomer && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.totalBookings}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.activeProjects}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.pendingBookings}</div>
                  </CardContent>
                </Card>
              </>
            )}

            {isWorker && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.stats.totalEarnings)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.completedJobs}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.averageRating.toFixed(1)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.stats.walletBalance)}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentBookings?.length > 0 ? (
                  <div className="space-y-4">
                    {data.recentBookings.map((booking: any) => (
                      <div key={booking.id} className="flex justify-between items-start border-b pb-2">
                        <div>
                          <p className="font-medium">
                            {isCustomer ? booking.worker.name : booking.customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.startDate)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                )}
              </CardContent>
            </Card>

            {isCustomer && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentProjects?.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentProjects.map((project: any) => (
                        <div key={project.id} className="border-b pb-2">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.city}, {project.state}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No projects yet</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
