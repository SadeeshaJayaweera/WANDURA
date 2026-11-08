'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  Navigation,
  Compass,
} from 'lucide-react'
import { formatCurrency, calculateDistance } from '@/lib/utils'
import { RankedWorkerCard } from '@/components/recommendation/RankedWorkerCard'
import { SRI_LANKAN_CITIES, SKILL_LABELS, getSkillLabel } from '@/lib/srilanka'

// Dynamic import of Leaflet Map to prevent SSR errors
const WorkerMap = dynamic(() => import('@/components/map/WorkerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 border border-gray-200">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
      <p className="text-sm">Loading Sri Lanka Map (ශ්‍රී ලංකා සිතියම)...</p>
    </div>
  ),
})

const SKILLS = [
  { value: 'ALL', label: 'All Trades (සියලුම ශ්‍රේණි)' },
  { value: 'MASON', label: 'Mason (මේසන් බාස්)' },
  { value: 'CARPENTER', label: 'Carpenter (වඩු බාස්)' },
  { value: 'WELDER', label: 'Welder (වෙල්ඩින් කාර්මික)' },
  { value: 'TILE_LAYER', label: 'Tile Layer (ටයිල් බාස්)' },
  { value: 'PLUMBER', label: 'Plumber (නල කාර්මික)' },
  { value: 'ELECTRICIAN', label: 'Electrician (විදුලි කාර්මික)' },
  { value: 'STEEL_FIXER', label: 'Steel Fixer (යකඩ බාස්)' },
  { value: 'PAINTER', label: 'Painter (තීන්ත ආලේපක)' },
]

export default function WorkersPage() {
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
              ශ්‍රී ලංකා 🇱🇰
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-gray-600">
              <Link href="/">Home</Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex-1">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900">Skilled Workers (කාර්මික ශිල්පීන්)</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Find Skilled Workers in Sri Lanka
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {loading
                  ? 'Searching verified professionals...'
                  : `${workers.length} verified tradespeople across Sri Lanka`}
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
                  <span>Map & List</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>List Only</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Map Only</span>
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
                <span>Filters</span>
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
                Filter by Trade, City, & Daily Rate (LKR)
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reset all
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Skill / Trade (කාණ්ඩය)
                </label>
                <Select
                  value={filters.skill}
                  onValueChange={(v) => setFilters({ ...filters, skill: v })}
                >
                  <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm">
                    <SelectValue placeholder="All Trades" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILLS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  City (නගරය)
                </label>
                <Select
                  value={filters.city}
                  onValueChange={(v) => setFilters({ ...filters, city: v === 'ALL' ? '' : v })}
                >
                  <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm">
                    <SelectValue placeholder="All Sri Lanka (දිවයින පුරා)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sri Lanka (දිවයින පුරා)</SelectItem>
                    {SRI_LANKAN_CITIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name} ({c.sinhala})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Min Rate (Rs. / day)
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
                  Max Rate (Rs. / day)
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
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearFilters()
                  fetchWorkers()
                }}
                className="rounded-xl text-sm"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Map Section */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-600" />
                <span>Live Location Map (සජීවී සිතියම)</span>
              </h2>
              {userLoc && (
                <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
                  📍 Near: {userLoc.city || `${userLoc.lat.toFixed(2)}, ${userLoc.lng.toFixed(2)}`}
                </span>
              )}
            </div>
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
                <span>Worker Profiles (කාර්මික ශිල්පීන්)</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
                <p className="text-sm">Loading workers...</p>
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
                <p className="text-lg font-semibold text-gray-900 mb-1">No workers found</p>
                <p className="text-sm text-gray-500 mb-6">
                  Try expanding your search criteria or choosing a different city.
                </p>
                <Button onClick={clearFilters} variant="outline" className="rounded-xl">
                  Clear Filters
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
  const skillLabel = getSkillLabel(worker.skill)
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
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-blue-700 mt-1">
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
                ~{distanceKm.toFixed(1)} km away
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
                ({worker.totalReviews || 0} reviews)
              </span>
            </div>
            {worker.experience && (
              <span className="text-xs text-gray-500">
                {worker.experience} yrs exp
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
          <span className="text-xs text-gray-400 ml-1">/ day (දිනකට)</span>
        </div>

        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 text-xs">
          <Link href={`/workers/${worker.userId}`}>
            View Profile & Book
          </Link>
        </Button>
      </div>
    </div>
  )
}
