'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer, Users, Calendar, FolderKanban, ShoppingBag, DollarSign,
  TrendingUp, LogOut, CheckCircle2, XCircle, Search, Sparkles,
  ExternalLink, ShieldCheck, ShieldAlert, Package, RefreshCw,
  Building2, Briefcase, Truck, ArrowUpRight
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'

const STATUS_BADGES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  ACCEPTED: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  SHIPPED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
}

export default function AdminDashboard({
  users: initialUsers,
  bookings: initialBookings,
  projects,
  products,
  transactions,
  orders: initialOrders,
  stats,
}: any) {
  const { t, isSinhala } = useLanguage()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'orders' | 'projects' | 'products' | 'transactions'>('overview')
  const [usersList, setUsersList] = useState<any[]>(initialUsers || [])
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [bookingFilter, setBookingFilter] = useState('ALL')
  const [orderFilter, setOrderFilter] = useState('ALL')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  // Toggle Worker Verification
  const handleToggleWorkerVerify = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, workerVerified: !currentStatus }),
      })
      if (!res.ok) throw new Error('Failed to update verification')
      
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === userId && u.workerProfile
            ? { ...u, workerProfile: { ...u.workerProfile, isVerified: !currentStatus } }
            : u
        )
      )
      toast({
        title: !currentStatus ? 'Worker Verified ✓' : 'Worker Unverified',
        description: `Worker verification status updated.`,
      })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Toggle Store Verification
  const handleToggleStoreVerify = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, storeVerified: !currentStatus }),
      })
      if (!res.ok) throw new Error('Failed to update store verification')

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === userId && u.storeProfile
            ? { ...u, storeProfile: { ...u.storeProfile, isVerified: !currentStatus } }
            : u
        )
      )
      toast({
        title: !currentStatus ? 'Hardware Store Verified ✓' : 'Store Unverified',
        description: `Hardware store verification status updated.`,
      })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Filtered users
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.phone?.includes(userSearch)
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Filtered bookings
  const filteredBookings = (initialBookings || []).filter((b: any) => {
    return bookingFilter === 'ALL' || b.status === bookingFilter
  })

  // Filtered orders
  const filteredOrders = (initialOrders || []).filter((o: any) => {
    return orderFilter === 'ALL' || o.status === orderFilter
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Wandura</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex border-gray-200 dark:border-slate-700">
              <Link href="/admin/recommendations" className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>AI Recommendations</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/" className="flex items-center gap-1 text-xs">
                <span>View Site</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="border-gray-200 dark:border-slate-700"
            >
              <LogOut className="h-4 w-4 mr-1.5 text-red-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white dark:bg-[#0c1222] border-r border-gray-200 dark:border-slate-800 min-h-[calc(100vh-61px)] p-3 flex-shrink-0">
          <nav className="space-y-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className={`w-full justify-start text-sm ${activeTab === 'overview' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className={`w-full justify-between text-sm ${activeTab === 'users' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Users & Verification
              </div>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                {usersList.length}
              </span>
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'ghost'}
              className={`w-full justify-between text-sm ${activeTab === 'bookings' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Bookings
              </div>
              {stats.pendingBookings > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  {stats.pendingBookings}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              className={`w-full justify-between text-sm ${activeTab === 'orders' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <div className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Material Orders
              </div>
              {stats.pendingOrders > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  {stats.pendingOrders}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'projects' ? 'default' : 'ghost'}
              className={`w-full justify-start text-sm ${activeTab === 'projects' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <FolderKanban className="h-4 w-4 mr-2" />
              Projects
            </Button>
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              className={`w-full justify-start text-sm ${activeTab === 'products' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package className="h-4 w-4 mr-2" />
              Hardware Catalog
            </Button>
            <Button
              variant={activeTab === 'transactions' ? 'default' : 'ghost'}
              className={`w-full justify-start text-sm ${activeTab === 'transactions' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Transactions
            </Button>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
              <Button asChild variant="outline" className="w-full justify-start text-xs border-dashed border-gray-300 dark:border-slate-700">
                <Link href="/admin/recommendations">
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-blue-500" />
                  AI Quality & Fairness
                </Link>
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-x-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-7xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sri Lanka Platform Overview</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Real-time operational metrics across workers, hardware stores, bookings, and revenue in LKR.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {stats.totalWorkers} workers • {stats.totalStores} stores
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                      {stats.pendingBookings} pending approvals
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Material Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                      {stats.pendingOrders} pending delivery
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Commission Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Math.abs(stats.totalRevenue?._sum?.amount || 0))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">10% platform fee</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Split */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Recent Worker Bookings</CardTitle>
                      <CardDescription>Latest appointments placed by customers</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                      {initialBookings.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="min-w-0 pr-3">
                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                              {booking.customer.name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                              Hired {booking.worker.name} • {formatDate(booking.createdAt)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(booking.totalAmount)}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_BADGES[booking.status] || ''}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Recent Financial Transactions</CardTitle>
                      <CardDescription>Payments, commissions, and withdrawals</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                      {transactions.slice(0, 5).map((tx: any) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="min-w-0 pr-3">
                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                              {tx.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                              {tx.type} • {formatDate(tx.createdAt)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {formatCurrency(tx.amount)}
                            </p>
                            <span className="text-[10px] text-gray-400">{tx.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: USERS & VERIFICATION */}
          {activeTab === 'users' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management & Verification</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Verify skilled tradespeople and partner hardware stores to unlock public badge status.
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-[#0c1222] p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search name, email, or phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 h-9 rounded-lg border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                  {['ALL', 'CUSTOMER', 'WORKER', 'HARDWARE_STORE', 'ADMIN'].map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={roleFilter === role ? 'default' : 'outline'}
                      onClick={() => setRoleFilter(role)}
                      className={`text-xs h-8 ${roleFilter === role ? 'bg-blue-600 text-white' : 'border-gray-200 dark:border-slate-700'}`}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/75 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">User</th>
                        <th className="px-5 py-3.5">Contact</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Trade / Store</th>
                        <th className="px-5 py-3.5">Verification & Actions</th>
                        <th className="px-5 py-3.5">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                      {filteredUsers.map((user) => {
                        const isWorker = user.role === 'WORKER'
                        const isStore = user.role === 'HARDWARE_STORE'
                        const workerVerified = user.workerProfile?.isVerified
                        const storeVerified = user.storeProfile?.isVerified

                        return (
                          <tr key={user.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400">
                              {user.phone || 'No phone'}
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              {isWorker && user.workerProfile && (
                                <div>
                                  <span className="font-medium text-gray-800 dark:text-slate-200">{user.workerProfile.skill}</span>
                                  <div className="text-gray-400">{user.workerProfile.city} • Rs. {user.workerProfile.dailyRate}/day</div>
                                </div>
                              )}
                              {isStore && user.storeProfile && (
                                <div>
                                  <span className="font-medium text-gray-800 dark:text-slate-200">{user.storeProfile.storeName}</span>
                                  <div className="text-gray-400">{user.storeProfile.city}</div>
                                </div>
                              )}
                              {!isWorker && !isStore && <span className="text-gray-400">Customer Account</span>}
                            </td>
                            <td className="px-5 py-4">
                              {isWorker && (
                                <Button
                                  size="sm"
                                  variant={workerVerified ? 'outline' : 'default'}
                                  disabled={updatingUserId === user.id}
                                  onClick={() => handleToggleWorkerVerify(user.id, !!workerVerified)}
                                  className={`text-xs h-7 px-2.5 font-semibold transition-all ${
                                    workerVerified
                                      ? 'border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                >
                                  {workerVerified ? (
                                    <span className="flex items-center gap-1">
                                      <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                                      Verified ✓
                                    </span>
                                  ) : (
                                    'Verify Worker'
                                  )}
                                </Button>
                              )}
                              {isStore && (
                                <Button
                                  size="sm"
                                  variant={storeVerified ? 'outline' : 'default'}
                                  disabled={updatingUserId === user.id}
                                  onClick={() => handleToggleStoreVerify(user.id, !!storeVerified)}
                                  className={`text-xs h-7 px-2.5 font-semibold transition-all ${
                                    storeVerified
                                      ? 'border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40'
                                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                                  }`}
                                >
                                  {storeVerified ? (
                                    <span className="flex items-center gap-1">
                                      <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                                      Verified ✓
                                    </span>
                                  ) : (
                                    'Verify Store'
                                  )}
                                </Button>
                              )}
                              {!isWorker && !isStore && (
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                  user.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {user.emailVerified ? 'Active' : 'Unconfirmed'}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                              {formatDate(user.createdAt)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Bookings Oversight</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage service requests between Sri Lankan homeowners, builders, and tradespeople.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={bookingFilter === st ? 'default' : 'outline'}
                      onClick={() => setBookingFilter(st)}
                      className={`text-xs h-8 ${bookingFilter === st ? 'bg-blue-600 text-white' : 'border-gray-200 dark:border-slate-700'}`}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/75 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Booking ID</th>
                        <th className="px-5 py-3.5">Customer</th>
                        <th className="px-5 py-3.5">Worker Hired</th>
                        <th className="px-5 py-3.5">Site Location</th>
                        <th className="px-5 py-3.5">Duration</th>
                        <th className="px-5 py-3.5">Total Amount</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                      {filteredBookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-gray-400">{b.id.slice(0, 10)}...</td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{b.customer.name}</div>
                            <div className="text-xs text-gray-400">{b.customer.phone || b.customer.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{b.worker.name}</div>
                            <div className="text-xs text-gray-400">{b.worker.phone || b.worker.email}</div>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300">
                            {b.siteCity || 'Western Province'}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(b.startDate)} → {formatDate(b.endDate)}
                          </td>
                          <td className="px-5 py-4 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {formatCurrency(b.totalAmount)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${STATUS_BADGES[b.status] || ''}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: MATERIAL ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hardware Material Orders</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Track construction supply orders routed through Sri Lankan partner hardware stores.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', 'PENDING', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={orderFilter === st ? 'default' : 'outline'}
                      onClick={() => setOrderFilter(st)}
                      className={`text-xs h-8 ${orderFilter === st ? 'bg-blue-600 text-white' : 'border-gray-200 dark:border-slate-700'}`}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/75 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Order #</th>
                        <th className="px-5 py-3.5">Hardware Store</th>
                        <th className="px-5 py-3.5">Delivery City</th>
                        <th className="px-5 py-3.5">Items</th>
                        <th className="px-5 py-3.5">Total (LKR)</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                            No orders found matching this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o: any) => (
                          <tr key={o.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{o.orderNumber}</td>
                            <td className="px-5 py-4">
                              <div className="font-semibold text-gray-900 dark:text-white">{o.store?.storeName || 'Hardware Store'}</div>
                              <div className="text-xs text-gray-400">{o.store?.city}</div>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300">
                              {o.deliveryCity}
                              <div className="text-[11px] text-gray-400 truncate max-w-xs">{o.deliveryAddress}</div>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              {o.items?.length || 0} materials
                              <div className="text-[11px] text-gray-400 truncate max-w-xs">
                                {o.items?.map((i: any) => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ')}
                              </div>
                            </td>
                            <td className="px-5 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              {formatCurrency(o.totalAmount)}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${STATUS_BADGES[o.status] || ''}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                              {formatDate(o.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6 max-w-7xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Client Construction Projects</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Active residential and commercial construction sites across Sri Lanka.
                </p>
              </div>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/75 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Project Name</th>
                        <th className="px-5 py-3.5">Homeowner / Builder</th>
                        <th className="px-5 py-3.5">Location</th>
                        <th className="px-5 py-3.5">Budget</th>
                        <th className="px-5 py-3.5">Tasks</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                      {projects.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-sm">{p.description || 'No description'}</div>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300">
                            {p.customer?.name}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400">
                            {p.city || 'Colombo'}, {p.state || 'Western Province'}
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                            {formatCurrency(p.budget || 0)}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500">
                            {p.tasks?.length || 0} tasks
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${STATUS_BADGES[p.status] || ''}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 6: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-7xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hardware Catalog & Materials</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  All construction supplies, cement, sand, bricks, and steel listed by partner stores.
                </p>
              </div>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/75 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Material</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Hardware Store</th>
                        <th className="px-5 py-3.5">Unit Price</th>
                        <th className="px-5 py-3.5">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                      {products.map((prod: any) => (
                        <tr key={prod.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{prod.name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">{prod.description || 'Verified hardware grade'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                              {prod.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs">
                            <div className="font-medium text-gray-900 dark:text-white">{prod.store?.storeName}</div>
                            <div className="text-gray-400">{prod.store?.city}</div>
                          </td>
                          <td className="px-5 py-4 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            Rs. {prod.price.toLocaleString()} / {prod.unit}
                          </td>
                          <td className="px-5 py-4 text-xs font-medium">
                            {prod.stock > 0 ? (
                              <span className="text-green-600 dark:text-green-400">{prod.stock} {prod.unit}s available</span>
                            ) : (
                              <span className="text-red-500">Out of Stock</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 7: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 max-w-7xl">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Financial Ledger</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Complete audit trail of all transactions, client payments, commissions, and withdrawals.
                </p>
              </div>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/75 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Transaction ID</th>
                        <th className="px-5 py-3.5">User</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5">Amount (LKR)</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                      {transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-gray-400">{tx.id.slice(0, 10)}...</td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{tx.user?.name || 'Platform User'}</div>
                            <div className="text-xs text-gray-400">{tx.user?.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {tx.type}
                            </span>
                          </td>
                          <td className={`px-5 py-4 font-bold whitespace-nowrap ${tx.amount < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                            {formatDate(tx.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
