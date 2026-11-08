'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'
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
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  ACCEPTED: 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  IN_PROGRESS: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  COMPLETED: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  REJECTED: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  CANCELLED: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
}

export default function DashboardContent({ session, data }: any) {
  const { t, isSinhala } = useLanguage()
  const isCustomer = data?.role === 'CUSTOMER'
  const isWorker = data?.role === 'WORKER'
  const isStore = data?.role === 'HARDWARE_STORE'

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  const customerLinks = [
    { href: '/workers', icon: Users, label: 'Find Workers' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
    { href: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/dashboard/orders', icon: ShoppingBag, label: 'Material Orders' },
    { href: '/estimator', icon: TrendingUp, label: 'Cost Estimator' },
  ]

  const workerLinks = [
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/dashboard/earnings', icon: Wallet, label: 'Earnings & Wallet' },
    { href: '/dashboard/profile', icon: Users, label: 'My Profile' },
  ]

  const storeLinks = [
    { href: '/dashboard/products', icon: ShoppingBag, label: 'Products Catalog' },
    { href: '/dashboard/orders', icon: Calendar, label: 'Incoming Orders' },
    { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ]

  const navLinks = isCustomer ? customerLinks : isWorker ? workerLinks : storeLinks

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-gray-100 flex flex-col transition-colors">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 h-16 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <Link href="/" className="flex items-center gap-2 group mr-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden md:block">Wandura</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {session?.user?.role === 'ADMIN' && (
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs">
              <Link href="/admin">Admin Console</Link>
            </Button>
          )}
          <LanguageToggle />
          <ThemeToggle />
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 capitalize">{data?.role?.toLowerCase()?.replace('_', ' ')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white rounded-lg gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white dark:bg-[#0c1222] border-r border-gray-200 dark:border-slate-800 flex-shrink-0 p-4 hidden md:block">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="pt-3 pb-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
                {isCustomer ? 'Customer' : isWorker ? 'Worker' : isStore ? 'Hardware Store' : 'Console'}
              </p>
            </div>

            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-all duration-150"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                {session?.user?.name?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Wandura Sri Lanka
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {isCustomer && (
                <>
                  <StatCard
                    title="Total Bookings"
                    value={data?.stats?.totalBookings || 0}
                    icon={<Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    bg="bg-blue-50 dark:bg-blue-950/60"
                    href="/dashboard/bookings"
                  />
                  <StatCard
                    title="Active Projects"
                    value={data?.stats?.activeProjects || 0}
                    icon={<FolderKanban className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
                    bg="bg-violet-50 dark:bg-violet-950/60"
                    href="/dashboard/projects"
                  />
                  <StatCard
                    title="Pending Approvals"
                    value={data?.stats?.pendingBookings || 0}
                    icon={<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                    bg="bg-amber-50 dark:bg-amber-950/60"
                    href="/dashboard/bookings"
                  />
                  <StatCard
                    title="Material Orders"
                    value={data?.stats?.totalOrders || 0}
                    icon={<ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />}
                    bg="bg-green-50 dark:bg-green-950/60"
                    href="/dashboard/orders"
                  />
                </>
              )}
              {isWorker && (
                <>
                  <StatCard
                    title="Total Earnings"
                    value={formatCurrency(data?.stats?.totalEarnings || 0)}
                    icon={<TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
                    bg="bg-green-50 dark:bg-green-950/60"
                    href="/dashboard/earnings"
                  />
                  <StatCard
                    title="Completed Jobs"
                    value={data?.stats?.completedJobs || 0}
                    icon={<Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    bg="bg-blue-50 dark:bg-blue-950/60"
                    href="/dashboard/bookings"
                  />
                  <StatCard
                    title="Avg. Rating"
                    value={data?.stats?.averageRating ? data.stats.averageRating.toFixed(1) : '5.0'}
                    icon={<Star className="h-4 w-4 text-amber-500" />}
                    bg="bg-amber-50 dark:bg-amber-950/60"
                    href="/dashboard/profile"
                  />
                  <StatCard
                    title="Wallet Balance"
                    value={formatCurrency(data?.stats?.walletBalance || 0)}
                    icon={<Wallet className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
                    bg="bg-violet-50 dark:bg-violet-950/60"
                    href="/dashboard/earnings"
                  />
                </>
              )}
              {isStore && (
                <>
                  <StatCard
                    title="Total Products"
                    value={data?.stats?.totalProducts || 0}
                    icon={<ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    bg="bg-blue-50 dark:bg-blue-950/60"
                    href="/dashboard/products"
                  />
                  <StatCard
                    title="Total Orders"
                    value={data?.stats?.totalOrders || 0}
                    icon={<Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                    bg="bg-purple-50 dark:bg-purple-950/60"
                    href="/dashboard/orders"
                  />
                  <StatCard
                    title="Pending Orders"
                    value={data?.stats?.pendingOrders || 0}
                    icon={<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                    bg="bg-amber-50 dark:bg-amber-950/60"
                    href="/dashboard/orders"
                  />
                  <StatCard
                    title="Store Status"
                    value={data?.profile?.isVerified ? 'Verified ✓' : 'Active'}
                    icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                    bg="bg-emerald-50 dark:bg-emerald-950/60"
                  />
                </>
              )}
            </div>

            {/* Quick actions banner */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {isCustomer && (
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm">
                  <h3 className="font-semibold text-lg mb-1">Need a skilled worker?</h3>
                  <p className="text-blue-200 text-sm mb-4">Browse verified masons, welders, electricians and plumbers near you.</p>
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
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-sm">
                  <h3 className="font-semibold text-lg mb-1">Your profile is live!</h3>
                  <p className="text-green-200 text-sm mb-4">Keep your rates and availability updated to get more bookings.</p>
                  <Button
                    asChild
                    className="bg-white text-green-700 hover:bg-green-50 rounded-xl font-medium gap-2"
                    size="sm"
                  >
                    <Link href="/dashboard/profile">
                      <Users className="h-4 w-4" />
                      Edit Profile & Rates
                    </Link>
                  </Button>
                </div>
              )}

              {isStore && (
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-sm">
                  <h3 className="font-semibold text-lg mb-1">Hardware Store Portal</h3>
                  <p className="text-purple-200 text-sm mb-4">List materials, manage stock, and process customer deliveries.</p>
                  <Button
                    asChild
                    className="bg-white text-purple-700 hover:bg-purple-50 rounded-xl font-medium gap-2"
                    size="sm"
                  >
                    <Link href="/dashboard/products">
                      <ShoppingBag className="h-4 w-4" />
                      Add Materials
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
                    className="bg-white dark:bg-[#0c1222] border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Icon className="h-4 w-4 text-gray-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
                  <Link
                    href="/dashboard/bookings"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {data?.recentBookings?.length > 0 ? (
                    data.recentBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {isCustomer ? booking.worker?.name : booking.customer?.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(booking.startDate)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ml-3 flex-shrink-0 ${STATUS_COLORS[booking.status] ?? STATUS_COLORS.CANCELLED}`}>
                          {booking.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-sm text-gray-400">
                      <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-slate-700" />
                      No bookings yet
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Projects or Recent Orders */}
              {isCustomer ? (
                <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
                    <Link
                      href="/dashboard/projects"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {data?.recentProjects?.length > 0 ? (
                      data.recentProjects.map((project: any) => (
                        <div key={project.id} className="px-5 py-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                            <span className="text-xs text-gray-400">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
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
                        <FolderKanban className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-slate-700" />
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
              ) : isStore ? (
                <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recent Material Orders</h3>
                    <Link
                      href="/dashboard/orders"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {data?.recentOrders?.length > 0 ? (
                      data.recentOrders.map((order: any) => (
                        <div key={order.id} className="px-5 py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{order.orderNumber}</p>
                            <p className="text-xs text-gray-400">{order.deliveryCity} • {formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(order.totalAmount)}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-sm text-gray-400">
                        <ShoppingBag className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-slate-700" />
                        No orders received yet
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trade Reputation & Payouts</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
                    Maintain high client ratings by arriving on time and executing quality work. Payouts can be requested anytime from your earnings wallet.
                  </p>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    <Link href="/dashboard/earnings">View Wallet Details</Link>
                  </Button>
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
    <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
        {href && <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">{title}</p>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>
}
