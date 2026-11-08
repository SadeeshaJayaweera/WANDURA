'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Hammer, TrendingUp, DollarSign, Calendar, Package, Star, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?period=${period}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const isWorker = session?.user?.role === 'WORKER'
  const isCustomer = session?.user?.role === 'CUSTOMER'
  const isStore = session?.user?.role === 'HARDWARE_STORE'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-gray-200 dark:bg-slate-800" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Hammer className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-gray-900 dark:text-white">Wandura Analytics</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <div className="flex gap-2">
            <Button
              variant={period === '7' ? 'default' : 'outline'}
              onClick={() => setPeriod('7')}
            >
              7 Days
            </Button>
            <Button
              variant={period === '30' ? 'default' : 'outline'}
              onClick={() => setPeriod('30')}
            >
              30 Days
            </Button>
            <Button
              variant={period === '90' ? 'default' : 'outline'}
              onClick={() => setPeriod('90')}
            >
              90 Days
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading analytics...</div>
        ) : analytics ? (
          <>
            {/* Worker Analytics */}
            {isWorker && (
              <>
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(analytics.totalEarnings || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.completedJobs || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.averageRating?.toFixed(1) || '0.0'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.totalReviews || 0} reviews
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.activeJobs || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Earnings Chart */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Earnings Over Time</CardTitle>
                    <CardDescription>Your daily earnings in the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {Object.entries(analytics.earningsByDate || {}).map(([date, amount]: any) => {
                        const maxAmount = Math.max(...Object.values(analytics.earningsByDate || { '0': 1 }).map((v: any) => Number(v) || 0))
                        return (
                          <div key={date} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-primary rounded-t"
                              style={{
                                height: `${(Number(amount) / maxAmount) * 100}%`,
                                minHeight: '2px',
                              }}
                            />
                            <span className="text-xs mt-2 rotate-45 origin-left">
                              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Customer Analytics */}
            {isCustomer && (
              <>
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(analytics.totalSpent || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalBookings || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.activeProjects || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.completedProjects || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Store Analytics */}
            {isStore && (
              <>
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(analytics.totalRevenue || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalOrders || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.pendingOrders || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.completedOrders || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Products */}
                {analytics.topProducts && analytics.topProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Products</CardTitle>
                      <CardDescription>Best performing products in the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.topProducts.map((product: any, index: number) => (
                          <div key={index} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Sold: {product.quantity} units
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(product.revenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12">No analytics data available</div>
        )}
      </div>
    </div>
  )
}
