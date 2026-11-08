'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer, ShoppingBag, ArrowLeft, Loader2, MapPin, Phone,
  CheckCircle2, Clock, Truck, Package, XCircle, ChevronRight,
  Store, AlertCircle, RefreshCw
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'

const STATUS_BADGES: Record<string, { bg: string; label: string; icon: any }> = {
  PENDING: {
    bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    label: 'Pending Store Confirmation',
    icon: Clock,
  },
  ACCEPTED: {
    bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    label: 'Accepted by Hardware Store',
    icon: CheckCircle2,
  },
  PROCESSING: {
    bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    label: 'Materials Being Packed',
    icon: Package,
  },
  SHIPPED: {
    bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    label: 'Out for Site Delivery',
    icon: Truck,
  },
  DELIVERED: {
    bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    label: 'Delivered to Site',
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    label: 'Cancelled',
    icon: XCircle,
  },
}

export default function OrdersDashboardPage() {
  const { data: session, status } = useSession()
  const { t, isSinhala } = useLanguage()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, filter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.append('status', filter)
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Failed to load orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: 'Failed to fetch material orders.' })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')

      toast({
        title: 'Order Status Updated',
        description: `Order marked as ${newStatus}.`,
      })
      fetchOrders()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    } finally {
      setUpdatingId(null)
    }
  }

  const isStore = session?.user?.role === 'HARDWARE_STORE'
  const isCustomer = session?.user?.role === 'CUSTOMER'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-gray-900 dark:text-white">
                {isStore ? (isSinhala ? 'හාඩ්වෙයාර් ඇණවුම් කළමනාකරණය' : 'Store Material Orders') : (isSinhala ? 'මගේ ඉදිකිරීම් ද්‍රව්‍ය ඇණවුම්' : 'My Material Orders')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isStore ? (isSinhala ? 'පාරිභෝගික ඇණවුම්' : 'Incoming Customer Orders') : (isSinhala ? 'ඉදිකිරීම් ද්‍රව්‍ය ඇණවුම්' : 'Construction Material Orders')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isStore
                ? 'Review site delivery addresses, process items, and dispatch materials across Sri Lanka.'
                : 'Track the delivery of cement, sand, bricks, steel, and hardware supplies.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'PENDING', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={filter === st ? 'default' : 'outline'}
                onClick={() => setFilter(st)}
                className={`text-xs h-8 ${filter === st ? 'bg-blue-600 text-white' : 'border-gray-200 dark:border-slate-800'}`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-sm text-gray-500">Loading material orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 text-center py-16">
            <CardContent>
              <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No orders found</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                {isStore
                  ? 'New customer material orders placed through Wandura will show up here in real time.'
                  : 'You have not placed any hardware material orders yet. Explore partner stores to order supplies.'}
              </p>
              {!isStore && (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Link href="/stores">Browse Hardware Stores</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = STATUS_BADGES[order.status] || STATUS_BADGES.PENDING
              const StatusIcon = statusCfg.icon

              return (
                <Card key={order.id} className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-5">
                    {/* Top line: Order # & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">{formatDate(order.createdAt)}</span>
                        </div>
                        {order.store && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-300 mt-1">
                            <Store className="h-3.5 w-3.5 text-gray-400" />
                            <span>{order.store.storeName} ({order.store.city})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.bg}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Items List */}
                    <div className="py-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ordered Materials</p>
                      <div className="divide-y divide-gray-50 dark:divide-slate-800/60">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="py-2 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-700 dark:text-slate-300">
                                {item.quantity} {item.product?.unit || 'units'}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-slate-200">
                                {item.product?.name || 'Material item'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.totalPrice)}
                              </span>
                              <div className="text-[11px] text-gray-400">
                                @ Rs. {item.unitPrice.toLocaleString()}/{item.product?.unit || 'unit'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Footer */}
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          <span><strong>Site Delivery:</strong> {order.deliveryAddress}, {order.deliveryCity}</span>
                        </div>
                        {order.notes && (
                          <p className="text-gray-400 pl-5 italic">&quot;{order.notes}&quot;</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Paid</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>

                        {/* Store Action Buttons */}
                        {isStore && (
                          <div className="flex items-center gap-2">
                            {order.status === 'PENDING' && (
                              <Button
                                size="sm"
                                disabled={updatingId === order.id}
                                onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 rounded-lg"
                              >
                                Accept Order
                              </Button>
                            )}
                            {order.status === 'ACCEPTED' && (
                              <Button
                                size="sm"
                                disabled={updatingId === order.id}
                                onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 rounded-lg"
                              >
                                Pack Materials
                              </Button>
                            )}
                            {order.status === 'PROCESSING' && (
                              <Button
                                size="sm"
                                disabled={updatingId === order.id}
                                onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8 rounded-lg"
                              >
                                Dispatch for Delivery
                              </Button>
                            )}
                            {order.status === 'SHIPPED' && (
                              <Button
                                size="sm"
                                disabled={updatingId === order.id}
                                onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 rounded-lg"
                              >
                                Mark Delivered ✓
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
