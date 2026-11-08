'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Star, MapPin, Hammer, Sparkles, Filter, Search, SlidersHorizontal,
  Shield, ChevronRight, Loader2, Users, XCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { RankedWorkerCard } from '@/components/recommendation/RankedWorkerCard'

const SKILLS = [
  { value: 'ALL', label: 'All Skills' },
  { value: 'MASON', label: 'Mason' },
  { value: 'WELDER', label: 'Welder' },
  { value: 'CARPENTER', label: 'Carpenter' },
  { value: 'TILE_LAYER', label: 'Tile Layer' },
  { value: 'PLUMBER', label: 'Plumber' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'STEEL_FIXER', label: 'Steel Fixer' },
  { value: 'PAINTER', label: 'Painter' },
]

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearFilters = () => {
    setFilters({ skill: 'ALL', city: '', minRate: '', maxRate: '', isAvailable: 'true', lat: '', lng: '', budget: '' })
  }

  const hasActiveFilters = filters.skill !== 'ALL' || filters.city || filters.minRate || filters.maxRate

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
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

      <div className="container mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900">Find Workers</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Find Skilled Workers</h1>
              <p className="text-gray-500 mt-1">
                {!loading && `${workers.length} workers available`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-lg gap-2 ${showFilters ? 'border-blue-400 text-blue-600 bg-blue-50' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">!</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* View toggle — Smart vs All */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-sm">
            <button
              onClick={() => { setUseRecommendedView(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !useRecommendedView ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4" />
              All Workers
            </button>
            <button
              onClick={() => { setUseRecommendedView(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                useRecommendedView ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Smart Match
            </button>
          </div>
          {useRecommendedView && (
            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Requires skill + location + budget
            </span>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                Filter Workers
              </h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <XCircle className="h-3.5 w-3.5" /> Clear all
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</label>
                <Select value={filters.skill} onValueChange={(v) => setFilters({ ...filters, skill: v })}>
                  <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-gray-50">
                    <SelectValue placeholder="All Skills" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILLS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">City</label>
                <Input
                  placeholder="e.g. New York"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="h-10 rounded-xl border-gray-200 bg-gray-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Min Rate / day</label>
                <Input
                  placeholder="$0"
                  type="number"
                  value={filters.minRate}
                  onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                  className="h-10 rounded-xl border-gray-200 bg-gray-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Max Rate / day</label>
                <Input
                  placeholder="$999"
                  type="number"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                  className="h-10 rounded-xl border-gray-200 bg-gray-50"
                />
              </div>
            </div>

            {useRecommendedView && (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wider">Smart Match Parameters</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Job Latitude</label>
                    <Input
                      placeholder="e.g. 40.7128"
                      type="number"
                      step="0.000001"
                      value={filters.lat}
                      onChange={(e) => setFilters({ ...filters, lat: e.target.value })}
                      className="h-10 rounded-xl border-blue-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Job Longitude</label>
                    <Input
                      placeholder="e.g. -74.0060"
                      type="number"
                      step="0.000001"
                      value={filters.lng}
                      onChange={(e) => setFilters({ ...filters, lng: e.target.value })}
                      className="h-10 rounded-xl border-blue-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Budget ($)</label>
                    <Input
                      placeholder="e.g. 1000"
                      type="number"
                      value={filters.budget}
                      onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                      className="h-10 rounded-xl border-blue-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Button
                onClick={fetchWorkers}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 gap-2"
              >
                <Search className="h-4 w-4" />
                Search Workers
              </Button>
              <Button
                variant="outline"
                onClick={() => { clearFilters(); fetchWorkers(); }}
                className="rounded-xl"
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Smart search banner */}
        {isSmartSearch && (
          <div className="bg-blue-600 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-white flex-shrink-0" />
            <p className="text-sm text-blue-100">
              <span className="font-semibold text-white">AI-Ranked Results</span> — Workers are sorted by compatibility with your skill, location, and budget.
            </p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
            <p className="text-sm">Loading workers…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-red-700 mb-1">Failed to load workers</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button onClick={fetchWorkers} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Try again
            </Button>
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No workers found</p>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">Try adjusting your filters or searching a different skill or location.</p>
            <Button onClick={clearFilters} variant="outline" className="rounded-xl">
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workers.map((worker) =>
              isSmartSearch ? (
                <RankedWorkerCard key={worker.id} worker={worker} totalResults={workers.length} />
              ) : (
                <WorkerCard key={worker.id} worker={worker} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function WorkerCard({ worker }: { worker: any }) {
  const skillLabel = worker.skill?.replace(/_/g, ' ') ?? ''
  const initials = worker.user?.name
    ? worker.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          {worker.user?.image ? (
            <img
              src={worker.user.image}
              alt={worker.user.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">{worker.user?.name ?? 'Unknown'}</h3>
                <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full mt-1">
                  {skillLabel}
                </span>
              </div>
              {worker.isVerified && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  <Shield className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          {(worker.city || worker.state) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              <span>{[worker.city, worker.state].filter(Boolean).join(', ')}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${s <= Math.round(worker.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{worker.rating?.toFixed(1) ?? '0.0'}</span>
              <span className="text-xs text-gray-400">({worker.totalReviews ?? 0})</span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              worker.isAvailable ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
            }`}>
              {worker.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>

          {worker.bio && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{worker.bio}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(worker.dailyRate)}</span>
            <span className="text-xs text-gray-400">/day</span>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4"
          >
            <Link href={`/workers/${worker.userId}`}>
              View Profile
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
