'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, MapPin, Hammer, Sparkles, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { RankedWorkerCard } from '@/components/recommendation/RankedWorkerCard'

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
  
  // Track if current results are ML-ranked
  const [isSmartSearch, setIsSmartSearch] = useState(false)
  const [useRecommendedView, setUseRecommendedView] = useState(true)

  const fetchWorkers = async () => {
    setLoading(true)
    setIsSmartSearch(false)
    try {
      // If we have skill (not ALL) + lat + lng + budget + toggle is ON, trigger ML Recommendations pipeline
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
          })
        })
        const data = await response.json()
        setWorkers(data.results || [])
        setIsSmartSearch(true)
      } else {
        // Standard legacy Prisma filter fallback
        const params = new URLSearchParams()
        if (filters.skill && filters.skill !== 'ALL') params.append('skill', filters.skill)
        if (filters.city) params.append('city', filters.city)
        if (filters.minRate) params.append('minRate', filters.minRate)
        if (filters.maxRate) params.append('maxRate', filters.maxRate)
        if (filters.isAvailable) params.append('isAvailable', filters.isAvailable)

        const response = await fetch(`/api/workers?${params}`)
        const data = await response.json()
        setWorkers(data)
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Hammer className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Wandura</span>
          </Link>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Skilled Workers</h1>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Select value={filters.skill} onValueChange={(v) => setFilters({ ...filters, skill: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Skills</SelectItem>
                    <SelectItem value="MASON">Mason</SelectItem>
                    <SelectItem value="WELDER">Welder</SelectItem>
                    <SelectItem value="CARPENTER">Carpenter</SelectItem>
                    <SelectItem value="TILE_LAYER">Tile Layer</SelectItem>
                    <SelectItem value="PLUMBER">Plumber</SelectItem>
                    <SelectItem value="ELECTRICIAN">Electrician</SelectItem>
                    <SelectItem value="STEEL_FIXER">Steel Fixer</SelectItem>
                    <SelectItem value="PAINTER">Painter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
              <Input
                placeholder="Min Rate ($)"
                type="number"
                value={filters.minRate}
                onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
              />
              <Input
                placeholder="Max Rate ($)"
                type="number"
                value={filters.maxRate}
                onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
              />
            </div>
            
            {/* ML Context Inputs */}
            <div className="grid md:grid-cols-3 gap-4 mt-4 p-4 border rounded-md bg-muted/20">
              <div className="col-span-3 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                Smart Recommendations (Requires Skill)
              </div>
              <Input
                placeholder="Job Lat (e.g. 40.71)"
                type="number"
                step="0.000001"
                value={filters.lat}
                onChange={(e) => setFilters({ ...filters, lat: e.target.value })}
              />
              <Input
                placeholder="Job Lng (e.g. -74.00)"
                type="number"
                step="0.000001"
                value={filters.lng}
                onChange={(e) => setFilters({ ...filters, lng: e.target.value })}
              />
              <Input
                placeholder="Budget ($)"
                type="number"
                value={filters.budget}
                onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
              />
            </div>
            <Button onClick={fetchWorkers} className="mt-4">
              Search
            </Button>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-end mb-4">
          <div className="bg-muted p-1 rounded-lg flex items-center gap-1">
            <Button 
              variant={useRecommendedView ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => { setUseRecommendedView(true); fetchWorkers(); }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Recommended for you
            </Button>
            <Button 
              variant={!useRecommendedView ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => { setUseRecommendedView(false); fetchWorkers(); }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              All results
            </Button>
          </div>
        </div>

        {/* Workers Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : workers.length === 0 ? (
          <div className="text-center py-12">No workers found</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              isSmartSearch ? (
                <RankedWorkerCard key={worker.id} worker={worker} totalResults={workers.length} />
              ) : (
                <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{worker.user.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {worker.skill.replace('_', ' ')}
                        </p>
                      </div>
                      {worker.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{worker.city}, {worker.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{worker.rating?.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({worker.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(worker.dailyRate)}/day
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {worker.bio || 'No bio available'}
                      </p>
                      <Button asChild className="w-full mt-4">
                        <Link href={`/workers/${worker.userId}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
