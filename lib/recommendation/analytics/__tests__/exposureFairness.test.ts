import { computeExposureFairness } from '../exposureFairness'
import { PrismaClient } from '@prisma/client'

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    workerProfile: { findMany: jest.fn() },
    recommendationLog: { findMany: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Exposure Fairness Analytics', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('computes exact exposure fairness ratios based on paper formula', async () => {
    // 10 workers total: 5 New (50%), 3 Mid (30%), 2 Established (20%)
    prisma.workerProfile.findMany.mockResolvedValue([
      { totalReviews: 2 }, { totalReviews: 4 }, { totalReviews: 5 }, { totalReviews: 0 }, { totalReviews: 1 }, // 5 New
      { totalReviews: 10 }, { totalReviews: 15 }, { totalReviews: 20 }, // 3 Mid
      { totalReviews: 50 }, { totalReviews: 100 } // 2 Established
    ]);

    // 20 recommendations total: 
    // 4 New (20% of slots), 10 Mid (50% of slots), 6 Established (30% of slots)
    const logs = [
      ...Array(4).fill({ worker: { totalReviews: 2 } }), // New
      ...Array(10).fill({ worker: { totalReviews: 15 } }), // Mid
      ...Array(6).fill({ worker: { totalReviews: 50 } }) // Established
    ];
    prisma.recommendationLog.findMany.mockResolvedValue(logs);

    const dateRange = { from: new Date('2023-01-01'), to: new Date('2023-01-31') };
    const result = await computeExposureFairness(prisma, dateRange);

    // Expected pool shares: New = 0.50, Mid = 0.30, Est = 0.20
    // Expected slot shares: New = 0.20, Mid = 0.50, Est = 0.30
    // Expected fairness ratio (Slot Share / Pool Share):
    // New: 0.20 / 0.50 = 0.40
    // Mid: 0.50 / 0.30 = 1.67 (1.67 rounded)
    // Est: 0.30 / 0.20 = 1.50

    expect(result).toHaveLength(3);

    const newStats = result.find(r => r.tier === 'New (0-5)');
    expect(newStats?.poolShare).toBe(0.5);
    expect(newStats?.recommendationShare).toBe(0.2);
    expect(newStats?.exposureRatio).toBe(0.40);

    const midStats = result.find(r => r.tier === 'Mid (6-20)');
    expect(midStats?.poolShare).toBe(0.3);
    expect(midStats?.recommendationShare).toBe(0.5);
    expect(midStats?.exposureRatio).toBe(1.67);

    const estStats = result.find(r => r.tier === 'Established (21+)');
    expect(estStats?.poolShare).toBe(0.2);
    expect(estStats?.recommendationShare).toBe(0.3);
    expect(estStats?.exposureRatio).toBe(1.50);
  });
});
