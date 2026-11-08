import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, MapPin, BadgeCheck, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { RankedWorker } from '@/types/recommendation'
import { MatchScoreBadge } from './MatchScoreBadge'
import { useEffect } from 'react'
import { trackRecommendationClick } from '@/lib/analytics/trackRecommendationClick'
import { getSkillLabel } from '@/lib/srilanka'

interface RankedWorkerCardProps {
  worker: RankedWorker;
  totalResults: number;
}

export function RankedWorkerCard({ worker, totalResults }: RankedWorkerCardProps) {
  // Simple plain language translation of the strongest score vector
  const getExplanation = () => {
    if (!worker.scoreBreakdown) return "Good overall match"
    
    const { proximity, price, collab, rating, tag } = worker.scoreBreakdown
    
    if (collab > 1.5) return "Highly recommended based on similar customers in Sri Lanka"
    if (proximity > 1.0 && price > 1.0) return "Close to your site and fits your budget"
    if (rating > 1.5) return "Exceptional community rating"
    if (tag > 1.5) return "Has exactly the skills you need"
    if (price > 1.5) return "Excellent price fit"
    if (proximity > 1.5) return "Very close to your location"
    
    return "Solid overall match"
  }

  // Fire view analytics on mount
  useEffect(() => {
    if (worker.recommendationLogId) {
      trackRecommendationClick({
        recommendationLogId: worker.recommendationLogId,
        rank: worker.rank,
        modelVariant: 'hybrid', // Real app might pass this down from parent
        action: 'view'
      })
    }
  }, [worker.recommendationLogId, worker.rank])

  const profileHref = worker.recommendationLogId 
    ? `/workers/${worker.userId}?recLogId=${worker.recommendationLogId}`
    : `/workers/${worker.userId}`;

  const handleBookClick = () => {
    if (worker.recommendationLogId) {
      trackRecommendationClick({
        recommendationLogId: worker.recommendationLogId,
        rank: worker.rank,
        modelVariant: 'hybrid',
        action: 'book'
      })
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow relative overflow-hidden group border-primary/20">
      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg font-bold text-sm shadow-sm z-10 flex items-center gap-1">
        #{worker.rank} Match
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between pr-20">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {worker.user?.name || "Unknown Worker"}
              {worker.isVerified && <BadgeCheck className="h-5 w-5 text-green-500" />}
              <MatchScoreBadge worker={worker} totalResults={totalResults} />
            </CardTitle>
            <p className="text-sm text-blue-600 mt-1 font-semibold">
              {getSkillLabel(worker.skill)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{worker.city || 'Sri Lanka'}, {worker.state || ''}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{worker.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-sm text-muted-foreground">
              ({worker.totalReviews || 0} reviews)
            </span>
          </div>
          
          <div className="text-lg font-bold text-primary">
            {formatCurrency(worker.dailyRate)} <span className="text-xs font-normal text-muted-foreground">/ day (දිනකට)</span>
          </div>
          
          {/* Hover explanation tooltip area */}
          <div className="bg-primary/5 rounded p-2 text-sm text-primary flex items-start gap-2 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="italic">{getExplanation()}</span>
          </div>

          <Button asChild className="w-full mt-4" onClick={handleBookClick}>
            <Link href={profileHref}>View Profile to Book</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
