'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Hammer, Calendar, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function BookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') {
        params.append('status', filter)
      }
      const response = await fetch(`/api/bookings?${params}`)
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Booking ${status.toLowerCase()} successfully`,
        })
        fetchBookings()
      } else {
        throw new Error('Failed to update booking')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
      })
    }
  }

  const isWorker = session?.user?.role === 'WORKER'
  const isCustomer = session?.user?.role === 'CUSTOMER'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Hammer className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Wandura</span>
          </Link>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Bookings</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No bookings found</p>
              <p className="text-muted-foreground mb-4">
                {isCustomer
                  ? "You haven't made any bookings yet"
                  : "You haven't received any booking requests yet"}
              </p>
              {isCustomer && (
                <Button asChild>
                  <Link href="/workers">Find Workers</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {isWorker ? booking.customer.name : booking.worker.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.address}, {booking.city}, {booking.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(booking.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Skill</p>
                      <p className="font-medium">{booking.skill.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(booking.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(booking.endDate)}</p>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{booking.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t">
                    {isWorker && booking.status === 'PENDING' && (
                      <>
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'ACCEPTED')}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Booking
                        </Button>
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    {isWorker && booking.status === 'ACCEPTED' && (
                      <Button
                        onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS')}
                        className="flex-1"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Start Job
                      </Button>
                    )}

                    {isWorker && booking.status === 'IN_PROGRESS' && (
                      <Button
                        onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}

                    {booking.status === 'COMPLETED' && (
                      <div className="flex-1 text-center">
                        <p className="text-sm text-muted-foreground">
                          Payment Status:{' '}
                          <span className={`font-medium ${
                            booking.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </p>
                      </div>
                    )}

                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
