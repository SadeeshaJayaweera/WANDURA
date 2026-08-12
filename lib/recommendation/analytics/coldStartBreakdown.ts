import { PrismaClient } from '@prisma/client'

export interface ColdStartBreakdownResult {
  isColdStart: boolean;
  modelVariant: string;
  totalRecommendations: number;
  averageBookedRank: number | null;
}

export async function computeColdStartBreakdown(
  prisma: PrismaClient,
  dateRange: { from: Date; to: Date }
): Promise<ColdStartBreakdownResult[]> {
  const logs = await prisma.recommendationLog.findMany({
    where: {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to
      }
    },
    include: {
      bookings: {
        select: { id: true }
      }
    }
  });

  const groups: Record<string, { total: number; bookedRanks: number[] }> = {};

  for (const log of logs) {
    const key = `${log.isColdStart}-${log.modelVariant}`;
    if (!groups[key]) {
      groups[key] = { total: 0, bookedRanks: [] };
    }
    
    groups[key].total++;
    
    // If this recommendation led to a booking, track its rank
    if (log.bookings.length > 0) {
      groups[key].bookedRanks.push(log.rank);
    }
  }

  const results: ColdStartBreakdownResult[] = [];
  
  for (const [key, data] of Object.entries(groups)) {
    const [isColdStartStr, modelVariant] = key.split('-');
    const isColdStart = isColdStartStr === 'true';
    
    let averageBookedRank = null;
    if (data.bookedRanks.length > 0) {
      const sum = data.bookedRanks.reduce((a, b) => a + b, 0);
      averageBookedRank = Number((sum / data.bookedRanks.length).toFixed(2));
    }
    
    results.push({
      isColdStart,
      modelVariant,
      totalRecommendations: data.total,
      averageBookedRank
    });
  }

  return results;
}
