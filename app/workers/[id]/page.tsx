'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer,
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  Clock,
  Briefcase,
  Phone,
  Mail,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Share2,
  Heart,
  Award,
  Lock,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getSkillLabel } from '@/lib/srilanka'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function WorkerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { t, isSinhala } = useLanguage()

  const workerId = params?.id as string
  const recLogId = searchParams.get('recLogId')

  const [worker, setWorker] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Booking Form State
  const [bookingLoading, setBookingLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [siteCity, setSiteCity] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  useEffect(() => {
    if (!workerId) return
    fetchWorkerDetails()
  }, [workerId])

  const fetchWorkerDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/workers/${workerId}`)
      if (!res.ok) {
        throw new Error('Worker not found or unavailable')
      }
      const data = await res.json()
      setWorker(data.worker)
      setReviews(Array.isArray(data.reviews) ? data.reviews : [])

      // Prefill default city from worker if known
      if (data.worker?.city) {
        setSiteCity(data.worker.city)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load worker profile')
    } finally {
      setLoading(false)
    }
  }

  // Calculate booking days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 1
  }

  const daysCount = calculateDays()
  const dailyRate = worker?.dailyRate || 0
  const subtotal = dailyRate * daysCount
  const platformFee = Math.round(subtotal * 0.1) // 10% platform commission
  const totalAmount = subtotal

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book this worker.',
      })
      router.push(`/auth/signin?callbackUrl=/workers/${workerId}`)
      return
    }

    if (session.user.role !== 'CUSTOMER') {
      toast({
        title: 'Customer account needed',
        description: 'Only customer accounts can make worker bookings.',
      })
      return
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Dates required',
        description: 'Please select both start and end dates.',
      })
      return
    }

    if (!siteAddress.trim()) {
      toast({
        title: 'Site address required',
        description: 'Please provide the project location address.',
      })
      return
    }

    setBookingLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.userId,
          skill: worker.skill,
          startDate,
          endDate,
          address: siteAddress.trim(),
          city: siteCity.trim() || worker.city || 'Colombo',
          state: worker.state || 'Western Province',
          zipCode: worker.zipCode || '00100',
          description: jobDescription.trim() || `Booking for ${getSkillLabel(worker.skill)}`,
          recommendationLogId: recLogId || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      toast({
        title: 'Booking requested!',
        description: `Your request has been sent to ${worker.user?.name}.`,
      })

      router.push('/dashboard/bookings')
    } catch (err: any) {
      toast({
        title: 'Booking failed',
        description: err.message,
      })
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
          <Link href="/workers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to Workers
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm">Loading worker profile...</p>
        </div>
      </div>
    )
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
          <Link href="/workers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to Workers
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Worker Not Found</h2>
            <p className="text-sm text-gray-500 mb-6">{error || 'This worker profile does not exist or has been removed.'}</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Link href="/workers">Browse Available Workers</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const initials = worker.user?.name
    ? worker.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'LK'

  const skillLabel = getSkillLabel(worker.skill, isSinhala ? 'si' : 'en')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
              {t('countryTag')}
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            <Button variant="outline" size="sm" asChild className="rounded-xl border-gray-200">
              <Link href="/workers" className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" /> {t('nav.allWorkers')}
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm">
              <Link href="/dashboard">{t('nav.dashboard')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 flex-1 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">{t('nav.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/workers" className="hover:text-blue-600">{t('nav.workers')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium truncate">{worker.user?.name}</span>
        </div>

        {/* Worker Hero Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              {worker.user?.image ? (
                <img
                  src={worker.user.image}
                  alt={worker.user.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  {initials}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    {worker.user?.name}
                  </h1>
                  {worker.isVerified && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                      <ShieldCheck className="h-3.5 w-3.5" /> {t('common.verifiedTradesperson')}
                    </span>
                  )}
                </div>

                <p className="text-base font-semibold text-blue-600 mt-1">
                  {skillLabel}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {worker.city || 'Sri Lanka'}, {worker.state || ''}
                  </span>
                  {worker.latitude && worker.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${worker.latitude},${worker.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded-md"
                    >
                      🗺️ {t('common.googleMaps')}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    {worker.experience || 5}+ {t('common.years')} {t('common.experience')}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {worker.rating?.toFixed(1) || '5.0'} ({worker.totalReviews || 0} {t('common.reviews')})
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 w-full md:w-auto">
              <span className="text-xs text-gray-400 font-medium block">{t('common.dailyWage')}</span>
              <span className="text-3xl font-extrabold text-blue-600">
                {formatCurrency(worker.dailyRate)}
              </span>
              <span className="text-xs text-gray-400 block mt-0.5">
                {worker.hourlyRate ? `or ${formatCurrency(worker.hourlyRate)} / ${t('common.hour')}` : `/ ${t('common.day')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Content & Booking Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Details Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                {t('workerProfile.about')}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {worker.bio ||
                  'Experienced skilled tradesperson committed to quality craftsmanship, safety standards, and reliable on-time execution.'}
              </p>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-gray-900">{worker.totalJobs || worker.experience * 6 || 25}+</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('workerProfile.jobsCompleted')}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-green-600">100%</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('workerProfile.satisfaction')}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-blue-600">{worker.experience || 8} yrs</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('common.experience')}</p>
                </div>
              </div>
            </div>

            {/* Specialization Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                {t('workerProfile.specializations')}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {skillLabel}
                </span>
                {worker.skillTags?.length > 0 ? (
                  worker.skillTags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 capitalize"
                    >
                      {tag.tag.replace(/_/g, ' ')}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                      Residential Construction
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                      Renovations & Repairs
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                      Site Safety Compliance
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Work Portfolio & Photos */}
            {worker.portfolioImages && worker.portfolioImages.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    {t('workerProfile.portfolio')}
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">{t('workerProfile.portfolioDesc')}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {worker.portfolioImages.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="relative h-32 rounded-xl overflow-hidden bg-gray-100 group shadow-sm">
                      <img
                        src={imgUrl}
                        alt={`Work sample ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  {t('workerProfile.reviews')} ({reviews.length})
                </h3>
                <span className="text-sm font-bold text-gray-900 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  ★ {worker.rating?.toFixed(1) || '5.0'} / 5.0
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <p className="text-sm">No written reviews yet for this worker.</p>
                  <p className="text-xs mt-1">Book their services and be the first to leave feedback!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {review.author?.name || 'Verified Customer'}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{formatDate(review.createdAt)}</p>
                      {review.comment && (
                        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-7 shadow-lg sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('common.bookWorker')}</h3>
                  <p className="text-xs text-gray-400">{worker.user?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(worker.dailyRate)}</span>
                  <span className="text-xs text-gray-400 block">/ {t('common.day')}</span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {!session?.user && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <span>{t('authGate.bookingTitle')}</span>
                    </div>
                    <p className="text-[11px] text-amber-700 mb-2.5">
                      {t('authGate.bookingDesc')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs h-8">
                        <Link href={`/auth/signin?callbackUrl=/workers/${workerId}`}>{t('authGate.signIn')}</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-xl border-amber-300 text-amber-900 text-xs h-8 bg-white hover:bg-amber-100">
                        <Link href={`/auth/signup?callbackUrl=/workers/${workerId}`}>{t('authGate.createAccount')}</Link>
                      </Button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="b-start" className="text-xs font-semibold text-gray-700">
                      {t('workerProfile.startDate')} *
                    </Label>
                    <Input
                      id="b-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10 rounded-xl border-gray-200 bg-gray-50 mt-1 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="b-end" className="text-xs font-semibold text-gray-700">
                      {t('workerProfile.endDate')} *
                    </Label>
                    <Input
                      id="b-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-10 rounded-xl border-gray-200 bg-gray-50 mt-1 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="b-address" className="text-xs font-semibold text-gray-700">
                    {t('workerProfile.jobAddress')} *
                  </Label>
                  <Input
                    id="b-address"
                    placeholder="e.g. No. 124, Kandy Road, Kadawatha"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    className="h-10 rounded-xl border-gray-200 bg-gray-50 mt-1 text-xs"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="b-city" className="text-xs font-semibold text-gray-700">
                    {t('workerProfile.jobCity')}
                  </Label>
                  <Input
                    id="b-city"
                    placeholder="e.g. Colombo, Maharagama, Galle"
                    value={siteCity}
                    onChange={(e) => setSiteCity(e.target.value)}
                    className="h-10 rounded-xl border-gray-200 bg-gray-50 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="b-desc" className="text-xs font-semibold text-gray-700">
                    {t('workerProfile.jobDesc')}
                  </Label>
                  <Textarea
                    id="b-desc"
                    placeholder={t('workerProfile.jobDescPlaceholder')}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl border-gray-200 bg-gray-50 mt-1 text-xs resize-none"
                  />
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {formatCurrency(dailyRate)} &times; {daysCount} day{daysCount > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Service & Escrow Fee</span>
                    <span className="font-medium text-green-700">Included</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 flex justify-between text-sm font-bold text-gray-900">
                    <span>{t('common.totalEstimate')}:</span>
                    <span className="text-blue-600 text-base">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-200 text-sm gap-2 transition-all"
                >
                  {bookingLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    <span>{t('common.confirmBooking')}</span>
                  )}
                </Button>

                <p className="text-[11px] text-gray-400 text-center">
                  {t('workerProfile.escrowNote')}
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
