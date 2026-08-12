import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RankingQualityPanel() {
  const totalEvents = await prisma.recommendationLog.count();
  
  // Breakdown by model variant
  const modelVariantsRaw = await prisma.recommendationLog.groupBy({
    by: ['modelVariant'],
    _count: { id: true }
  });
  
  // Cold start vs warm start
  const coldStartStats = await prisma.recommendationLog.groupBy({
    by: ['isColdStart'],
    _count: { id: true }
  });

  const coldStartCount = coldStartStats.find(s => s.isColdStart)?._count.id || 0;
  const warmStartCount = coldStartStats.find(s => !s.isColdStart)?._count.id || 0;
  const totalEvaluated = coldStartCount + warmStartCount;
  const coldStartPercent = totalEvaluated > 0 ? ((coldStartCount / totalEvaluated) * 100).toFixed(1) : 0;
  const warmStartPercent = totalEvaluated > 0 ? ((warmStartCount / totalEvaluated) * 100).toFixed(1) : 0;

  // Average rank position of worker that was eventually booked
  const bookedLogs = await prisma.recommendationLog.findMany({
    where: {
      bookings: {
        some: {} // Has at least one booking
      }
    },
    select: {
      rank: true
    }
  });

  const avgBookedRank = bookedLogs.length > 0 
    ? (bookedLogs.reduce((sum, log) => sum + log.rank, 0) / bookedLogs.length).toFixed(1)
    : 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking Quality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Recommendations</p>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Avg Booked Rank</p>
            <p className="text-2xl font-bold text-primary">#{avgBookedRank}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Model Variants</p>
          <div className="space-y-2">
            {modelVariantsRaw.map(variant => (
              <div key={variant.modelVariant} className="flex justify-between items-center text-sm">
                <span>{variant.modelVariant}</span>
                <span className="font-semibold">{variant._count.id}</span>
              </div>
            ))}
            {modelVariantsRaw.length === 0 && (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Cold Start Ratio</p>
          <div className="flex gap-2 h-4 w-full rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-primary" 
              style={{ width: `${warmStartPercent}%` }} 
              title={`Warm Start: ${warmStartPercent}%`} 
            />
            <div 
              className="bg-secondary" 
              style={{ width: `${coldStartPercent}%` }} 
              title={`Cold Start: ${coldStartPercent}%`}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
            <span>Warm: {warmStartPercent}%</span>
            <span>Cold: {coldStartPercent}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
