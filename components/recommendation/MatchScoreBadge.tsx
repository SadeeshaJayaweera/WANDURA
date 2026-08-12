import { Badge } from '@/components/ui/badge'
import { RankedWorker } from '@/lib/recommendation/hybrid/rankPool'

interface MatchScoreBadgeProps {
  worker: RankedWorker;
  totalResults: number;
}

export function MatchScoreBadge({ worker, totalResults }: MatchScoreBadgeProps) {
  if (totalResults <= 0) return null;

  // Calculate qualitative match tier based on percentile
  // (e.g. rank 1 out of 10 -> percentile 1.0; rank 10 out of 10 -> 0.1)
  const percentile = (totalResults - worker.rank + 1) / totalResults;

  let label = "Match";
  let colorClass = "bg-blue-100 text-blue-800 border-blue-200";

  if (percentile > 0.8) {
    label = "Great match";
    colorClass = "bg-green-100 text-green-800 border-green-200";
  } else if (percentile > 0.5) {
    label = "Good match";
    colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  return (
    <Badge variant="outline" className={`${colorClass} ml-2 font-medium`}>
      {label}
    </Badge>
  )
}
