'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Star,
  MapPin,
  Hammer,
  Sparkles,
  Filter,
  Search,
  SlidersHorizontal,
  Shield,
  ChevronRight,
  Loader2,
  Users,
  XCircle,
  Map as MapIcon,
  LayoutGrid,
  Compass,
} from 'lucide-react'
import { formatCurrency, calculateDistance } from '@/lib/utils'
import { RankedWorkerCard } from '@/components/recommendation/RankedWorkerCard'
import { SRI_LANKAN_CITIES, getSkillLabel } from '@/lib/srilanka'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Dynamic import of Leaflet / Google Map to prevent SSR errors
const WorkerMap = dynamic(() => import('@/components/map/WorkerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 border border-gray-200">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
      <p className="text-sm">Loading Sri Lanka Interactive Map...</p>
    </div>
  ),
})

export default function WorkersPage() {
  const { t, isSinhala } = useLanguage()

  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'both' | 'grid' | 'map'>('both')
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number; city?: string } | null>(null)

  const [filters, setFilters] = useState({
    skill: 'ALL',
    city: '',
    minRate: '',
    maxRate: '',
    isAvailable: 'true',
    lat: '',
    lng: '',
    budget: '',
  })
  const [isSmartSearch, setIsSmartSearch] = useState(false)
  const [useRecommendedView, setUseRecommendedView] = useState(false)

  const tradeOptions = [
    { value: 'ALL', label: t('trade.all') },
    { value: 'MASON', label: t('trade.mason') },
    { value: 'CARPENTER', label: t('trade.carpenter') },
    { value: 'WELDER', label: t('trade.welder') },
    { value: 'TILE_LAYER', label: t('trade.tile_layer') },
    { value: 'PLUMBER', label: t('trade.plumber') },
    { value: 'ELECTRICIAN', label: t('trade.electrician') },
    { value: 'STEEL_FIXER', label: t('trade.steel_fixer') },
    { value: 'PAINTER', label: t('trade.painter') },
  ]

  const fetchWorkers = async () => {
    setLoading(true)
    setError(null)
    setIsSmartSearch(false)
    try {
      if (useRecommendedView && filters.skill !== 'ALL' && filters.lat && filters.lng && filters.budget) {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skill: filters.skill,
            lat: parseFloat(filters.lat),
            lng: parseFloat(filters.lng),
            budget: parseFloat(filters.budget),
            topK: 10,
          }),
        })
        if (!response.ok) throw new Error('Failed to fetch recommendations')
        const data = await response.json()
        setWorkers(data.results || [])
        setIsSmartSearch(true)
      } else {
        const params = new URLSearchParams()
        if (filters.skill && filters.skill !== 'ALL') params.append('skill', filters.skill)
        if (filters.city) params.append('city', filters.city)
        if (filters.minRate) params.append('minRate', filters.minRate)
        if (filters.maxRate) params.append('maxRate', filters.maxRate)
        if (filters.isAvailable) params.append('isAvailable', filters.isAvailable)

        const response = await fetch(`/api/workers?${params}`)
        if (!response.ok) throw new Error('Failed to fetch workers')
        const data = await response.json()
        setWorkers(Array.isArray(data) ? data : [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workers')
      setWorkers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  const handleLocationFound = (loc: { lat: number; lng: number; city: string }) => {
    setUserLoc(loc)
    setFilters((prev) => ({
      ...prev,
      lat: loc.lat.toString(),
      lng: loc.lng.toString(),
      city: loc.city,
    }))
  }

  const clearFilters = () => {
    setFilters({
      skill: 'ALL',
      city: '',
      minRate: '',
      maxRate: '',
      isAvailable: 'true',
      lat: '',
      lng: '',
      budget: '',
    })
    setUserLoc(null)
  }

  const hasActiveFilters =
    filters.skill !== 'ALL' || filters.city || filters.minRate || filters.maxRate || filters.lat

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

            <Button variant="ghost" size="sm" asChild className="text-gray-600 text-xs font-semibold">
              <Link href="/">{t('nav.home')}</Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm">
              <Link href="/dashboard">{t('nav.dashboard')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex-1 max-w-7xl">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">{t('nav.home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900">{t('nav.workers')}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {t('workers.title')}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {loading
                  ? t('common.loading')
                  : `${workers.length} ${t('workers.availableCount')}`}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-sm">
                <button
                  onClick={() => setViewMode('both')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'both' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>{t('common.bothView')}</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>{t('common.listView')}</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>{t('common.mapView')}</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl gap-2 text-xs font-semibold ${
                  showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : ''
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t('common.filters')}</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4 text-blue-600" />
                {t('common.filters')}
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" /> {t('common.clearFilters')}
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('common.filter')}
                </label>
                <Select
                  value={filters.skill}
                  onValueChange={(v) => setFilters({ ...filters, skill: v })}
                >
                  <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm">
                    <SelectValue placeholder={t('trade.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tradeOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('workers.selectCity')}
                </label>
                <Select
                  value={filters.city}
                  onValueChange={(v) => setFilters({ ...filters, city: v === 'ALL' ? '' : v })}
                >
                  <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm">
                    <SelectValue placeholder={t('workers.allCities')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t('workers.allCities')}</SelectItem>
                    {SRI_LANKAN_CITIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {isSinhala ? c.sinhala : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('workers.minRate')}
                </label>
                <Input
                  placeholder="e.g. 4000"
                  type="number"
                  value={filters.minRate}
                  onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                  className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('workers.maxRate')}
                </label>
                <Input
                  placeholder="e.g. 7000"
                  type="number"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                  className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={fetchWorkers}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 gap-2 text-sm font-medium"
              >
                <Search className="h-4 w-4" />
                {t('common.search')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearFilters()
                  fetchWorkers()
                }}
                className="rounded-xl text-sm"
              >
                {t('common.clearFilters')}
              </Button>
            </div>
          </div>
        )}

        {/* Map Section */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div className="mb-8">
            <WorkerMap
              workers={workers}
              userLocation={userLoc}
              onLocationFound={handleLocationFound}
            />
          </div>
        )}

        {/* Worker Cards Grid */}
        {(viewMode === 'both' || viewMode === 'grid') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>{t('nav.workers')}</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
                <p className="text-sm">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
                <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <p className="font-semibold text-red-700 mb-1">Failed to load workers</p>
                <p className="text-xs text-red-500 mb-4">{error}</p>
                <Button onClick={fetchWorkers} variant="outline" className="rounded-xl border-red-200">
                  Try Again
                </Button>
              </div>
            ) : workers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">{t('workers.noWorkers')}</p>
                <p className="text-sm text-gray-500 mb-6">{t('workers.noWorkersDesc')}</p>
                <Button onClick={clearFilters} variant="outline" className="rounded-xl">
                  {t('common.clearFilters')}
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {workers.map((worker) => (
                  <SriLankanWorkerCard
                    key={worker.id}
                    worker={worker}
                    userLocation={userLoc}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SriLankanWorkerCard({
  worker,
  userLocation,
}: {
  worker: any
  userLocation?: { lat: number; lng: number } | null
}) {
  const { isSinhala, t } = useLanguage()
  const skillLabel = getSkillLabel(worker.skill, isSinhala ? 'si' : 'en')

  const initials = worker.user?.name
    ? worker.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'LK'

  // Calculate real distance if user location is available
  let distanceKm: number | null = null
  if (userLocation && worker.latitude && worker.longitude) {
    distanceKm = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      worker.latitude,
      worker.longitude
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          {worker.user?.image ? (
            <img
              src={worker.user.image}
              alt={worker.user.name || 'Worker'}
              className="w-12 h-12 rounded-xl object-cover border border-blue-100 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                {worker.user?.name || 'Worker'}
              </h3>
              {worker.isVerified && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  <Shield className="h-3 w-3" />
                  {t('common.verified')}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-blue-600 mt-1">
              {skillLabel}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              {worker.city || 'Sri Lanka'}, {worker.state || ''}
            </span>
            {distanceKm !== null && (
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex-shrink-0">
                ~{distanceKm.toFixed(1)} km {t('common.away')}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-gray-800">
                {worker.rating?.toFixed(1) || '5.0'}
              </span>
              <span className="text-xs text-gray-400">
                ({worker.totalReviews || 0} {t('common.reviews')})
              </span>
            </div>
            {worker.experience && (
              <span className="text-xs text-gray-500">
                {worker.experience} {t('common.yrsExp')}
              </span>
            )}
          </div>

          {worker.bio && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pt-1">
              {worker.bio}
            </p>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(worker.dailyRate)}
          </span>
          <span className="text-xs text-gray-400 ml-1">/ {t('common.day')}</span>
        </div>

        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 text-xs font-semibold">
          <Link href={`/workers/${worker.userId}`}>
            {t('common.viewProfile')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
