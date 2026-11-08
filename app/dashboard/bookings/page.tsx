'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Hammer, Calendar, CheckCircle, XCircle, Clock, MapPin,
  ChevronRight, Loader2, ArrowLeft, AlertCircle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { getSkillLabel } from '@/lib/srilanka'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'

const STATUS_STYLES: Record<string, { bg: string; dot: string; label: string }> = {
  PENDING:     { bg: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500',  label: 'Pending' },
  ACCEPTED:    { bg: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500',  label: 'Accepted' },
  REJECTED:    { bg: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-500',    label: 'Rejected' },
  IN_PROGRESS: { bg: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500',   label: 'In Progress' },
  COMPLETED:   { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'Completed' },
  CANCELLED:   { bg: 'bg-gray-100 text-gray-600 border-gray-200',     dot: 'bg-gray-400',   label: 'Cancelled' },
}

const FILTERS = [
  { value: 'ALL', label: 'All Bookings' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function BookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.append('status', filter)
      const res = await fetch(`/api/bookings?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load bookings. Are you signed in?' })
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Update failed')

      toast({ title: 'Updated', description: `Booking marked as ${STATUS_STYLES[status]?.label ?? status}.` })
      fetchBookings()
    } catch {
      toast({ title: 'Error', description: 'Failed to update booking status.' })
    } finally {
      setUpdatingId(null)
    }
  }

  const isWorker = session?.user?.role === 'WORKER'
  const isCustomer = session?.user?.role === 'CUSTOMER'

  const counts = FILTERS.slice(1).reduce(
    (acc, f) => ({ ...acc, [f.value]: bookings.filter(b => b.status === f.value).length }),
    {} as Record<string, number>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="rounded-xl gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-gray-200 dark:bg-slate-800" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Hammer className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Wandura</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Page heading */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900">My Bookings</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-44 h-9 rounded-xl border-gray-200 bg-white text-sm">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(counts).filter(([, count]) => count > 0).map(([status, count]) => {
            const style = STATUS_STYLES[status]
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  filter === status ? style.bg + ' border-current' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {style.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
            <p className="text-sm">Loading bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No bookings found</p>
            <p className="text-gray-500 text-sm mb-6">
              {isCustomer ? "You haven't made any bookings yet." : "No booking requests yet."}
            </p>
            {isCustomer && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Link href="/workers">Find Workers</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.CANCELLED
              const isUpdating = updatingId === booking.id

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-base font-semibold text-gray-900">
                            {isWorker ? booking.customer?.name : booking.worker?.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {[booking.address, booking.city, booking.state].filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(booking.totalAmount)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-gray-100 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-0.5">Trade (ශ්‍රේණිය)</p>
                        <p className="text-sm font-semibold text-blue-600">{getSkillLabel(booking.skill)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-0.5">Start Date</p>
                        <p className="text-sm font-medium text-gray-700">{formatDate(booking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-0.5">End Date</p>
                        <p className="text-sm font-medium text-gray-700">{formatDate(booking.endDate)}</p>
                      </div>
                    </div>

                    {booking.description && (
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{booking.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isWorker && booking.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => updateBookingStatus(booking.id, 'ACCEPTED')}
                            disabled={isUpdating}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
                          >
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Accept
                          </Button>
                          <Button
                            onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                            disabled={isUpdating}
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {isWorker && booking.status === 'ACCEPTED' && (
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS')}
                          disabled={isUpdating}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                          Start Job
                        </Button>
                      )}

                      {isWorker && booking.status === 'IN_PROGRESS' && (
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          disabled={isUpdating}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Mark Completed
                        </Button>
                      )}

                      {booking.status === 'COMPLETED' && (
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          Payment:
                          <span className={`font-semibold ${booking.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}`}>
                            {booking.paymentStatus}
                          </span>
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="ml-auto text-gray-500 hover:text-blue-600 rounded-xl gap-1"
                      >
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          View Details <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
