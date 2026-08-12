import { PrismaClient } from '@prisma/client'

export interface ExposureFairnessTier {
  tier: string
  exposureRatio: number // (Recommendation Share) / (Pool Share)
  poolShare: number
  recommendationShare: number
}

export async function computeExposureFairness(
  prisma: PrismaClient, 
  dateRange: { from: Date, to: Date }
): Promise<ExposureFairnessTier[]> {
  // 1. Get the entire worker pool size and breakdown
  const allWorkers = await prisma.workerProfile.findMany({
    select: { totalReviews: true }
  })
  
  const totalWorkers = allWorkers.length || 1;
  const poolCounts = {
    new: allWorkers.filter(w => w.totalReviews <= 5).length,
    mid: allWorkers.filter(w => w.totalReviews > 5 && w.totalReviews <= 20).length,
    established: allWorkers.filter(w => w.totalReviews > 20).length,
  }

  // 2. Get the recommendation logs to calculate exposure share
  const logs = await prisma.recommendationLog.findMany({
    where: {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to
      }
    },
    include: {
      worker: { select: { totalReviews: true } }
    }
  })

  const totalLogs = logs.length || 1;
  const logCounts = {
    new: logs.filter(l => (l.worker?.totalReviews || 0) <= 5).length,
    mid: logs.filter(l => (l.worker?.totalReviews || 0) > 5 && (l.worker?.totalReviews || 0) <= 20).length,
    established: logs.filter(l => (l.worker?.totalReviews || 0) > 20).length,
  }

  // 3. Compute fairness ratio (share of exposure / share of pool)
  const computeRatio = (poolCount: number, logCount: number) => {
    const poolShare = poolCount / totalWorkers;
    const logShare = logCount / totalLogs;
    if (poolShare === 0) return { ratio: 0, poolShare, logShare };
    return { 
      ratio: Number((logShare / poolShare).toFixed(2)),
      poolShare: Number(poolShare.toFixed(2)),
      logShare: Number(logShare.toFixed(2))
    };
  }

  const newStats = computeRatio(poolCounts.new, logCounts.new);
  const midStats = computeRatio(poolCounts.mid, logCounts.mid);
  const estStats = computeRatio(poolCounts.established, logCounts.established);

  return [
    { tier: 'New (0-5)', exposureRatio: newStats.ratio, poolShare: newStats.poolShare, recommendationShare: newStats.logShare },
    { tier: 'Mid (6-20)', exposureRatio: midStats.ratio, poolShare: midStats.poolShare, recommendationShare: midStats.logShare },
    { tier: 'Established (21+)', exposureRatio: estStats.ratio, poolShare: estStats.poolShare, recommendationShare: estStats.logShare }
  ]
}
