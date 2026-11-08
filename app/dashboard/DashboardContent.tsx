'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
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
  Clock,
  ChevronRight,
  ArrowUpRight,
  Bell,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default function DashboardContent({ session, data }: any) {
  const isCustomer = data.role === 'CUSTOMER'
  const isWorker = data.role === 'WORKER'
  const isStore = data.role === 'HARDWARE_STORE'

  const initials = session.user.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  const customerLinks = [
    { href: '/workers', icon: Users, label: 'Find Workers' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
    { href: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/estimator', icon: TrendingUp, label: 'Cost Estimator' },
  ]

  const workerLinks = [
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/dashboard/earnings', icon: Wallet, label: 'Earnings' },
    { href: '/dashboard/profile', icon: Users, label: 'My Profile' },
  ]

  const storeLinks = [
    { href: '/dashboard/products', icon: ShoppingBag, label: 'Products' },
    { href: '/dashboard/orders', icon: Calendar, label: 'Orders' },
    { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ]

  const navLinks = isCustomer ? customerLinks : isWorker ? workerLinks : storeLinks

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-16 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <Link href="/" className="flex items-center gap-2 group mr-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">Wandura</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button className="relative w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Bell className="h-4 w-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{session.user.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{data.role?.toLowerCase()?.replace('_', ' ')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-100 flex-shrink-0 p-4 hidden md:block">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="pt-3 pb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                {isCustomer ? 'Customer' : isWorker ? 'Worker' : 'Store'}
              </p>
            </div>

            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                {session.user.name?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {isCustomer && (
                <>
                  <StatCard
                    title="Total Bookings"
                    value={data.stats.totalBookings}
                    icon={<Calendar className="h-4 w-4 text-blue-600" />}
                    bg="bg-blue-50"
                    href="/dashboard/bookings"
                  />
                  <StatCard
                    title="Active Projects"
                    value={data.stats.activeProjects}
                    icon={<FolderKanban className="h-4 w-4 text-violet-600" />}
                    bg="bg-violet-50"
                    href="/dashboard/projects"
                  />
                  <StatCard
                    title="Pending"
                    value={data.stats.pendingBookings}
                    icon={<Clock className="h-4 w-4 text-amber-600" />}
                    bg="bg-amber-50"
                  />
                  <StatCard
                    title="Workers Found"
                    value={data.stats.totalBookings}
                    icon={<Users className="h-4 w-4 text-green-600" />}
                    bg="bg-green-50"
                    href="/workers"
                  />
                </>
              )}
              {isWorker && (
                <>
                  <StatCard
                    title="Total Earnings"
                    value={formatCurrency(data.stats.totalEarnings)}
                    icon={<TrendingUp className="h-4 w-4 text-green-600" />}
                    bg="bg-green-50"
                  />
                  <StatCard
                    title="Completed Jobs"
                    value={data.stats.completedJobs}
                    icon={<Calendar className="h-4 w-4 text-blue-600" />}
                    bg="bg-blue-50"
                  />
                  <StatCard
                    title="Avg. Rating"
                    value={data.stats.averageRating?.toFixed(1)}
                    icon={<Star className="h-4 w-4 text-amber-500" />}
                    bg="bg-amber-50"
                  />
                  <StatCard
                    title="Wallet Balance"
                    value={formatCurrency(data.stats.walletBalance)}
                    icon={<Wallet className="h-4 w-4 text-violet-600" />}
                    bg="bg-violet-50"
                  />
                </>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {isCustomer && (
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                  <h3 className="font-semibold text-lg mb-1">Need a skilled worker?</h3>
                  <p className="text-blue-200 text-sm mb-4">Browse verified professionals near you.</p>
                  <Button
                    asChild
                    className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-medium gap-2"
                    size="sm"
                  >
                    <Link href="/workers">
                      <Users className="h-4 w-4" />
                      Find Workers
                    </Link>
                  </Button>
                </div>
              )}

              {isWorker && (
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
                  <h3 className="font-semibold text-lg mb-1">Your profile is live!</h3>
                  <p className="text-green-200 text-sm mb-4">Keep your availability updated to get more bookings.</p>
                  <Button
                    asChild
                    className="bg-white text-green-700 hover:bg-green-50 rounded-xl font-medium gap-2"
                    size="sm"
                  >
                    <Link href="/dashboard/profile">
                      <Users className="h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              )}

              {/* Quick nav cards */}
              <div className="grid grid-cols-2 gap-3">
                {navLinks.slice(0, 4).map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
                  <Link
                    href="/dashboard/bookings"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.recentBookings?.length > 0 ? (
                    data.recentBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {isCustomer ? booking.worker?.name : booking.customer?.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(booking.startDate)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ml-3 flex-shrink-0 ${STATUS_COLORS[booking.status] ?? STATUS_COLORS.CANCELLED}`}>
                          {booking.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-sm text-gray-400">
                      <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      No bookings yet
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Projects (customers) */}
              {isCustomer && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Recent Projects</h3>
                    <Link
                      href="/dashboard/projects"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.recentProjects?.length > 0 ? (
                      data.recentProjects.map((project: any) => (
                        <div key={project.id} className="px-5 py-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{project.name}</p>
                            <span className="text-xs text-gray-400">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5">
                            {[project.city, project.state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-sm text-gray-400">
                        <FolderKanban className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                        No projects yet
                        <div className="mt-3">
                          <Button size="sm" asChild variant="outline" className="rounded-lg text-xs">
                            <Link href="/dashboard/projects">Create Project</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  bg,
  href,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  bg: string
  href?: string
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
        {href && <ArrowUpRight className="h-3.5 w-3.5 text-gray-300" />}
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 font-medium">{title}</p>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>
}
