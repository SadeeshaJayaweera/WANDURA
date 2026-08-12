import { computeColdStartBreakdown } from '../coldStartBreakdown'
import { PrismaClient } from '@prisma/client'

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    recommendationLog: { findMany: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Cold Start Breakdown Analytics', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('groups by cold start and variant, and computes average booked rank', async () => {
    const logs = [
      // Cold start heuristic - 3 recommendations, 2 bookings (ranks 1 and 3) -> avg booked rank = 2.0
      { isColdStart: true, modelVariant: 'popularity', rank: 1, bookings: [{ id: 'b1' }] },
      { isColdStart: true, modelVariant: 'popularity', rank: 2, bookings: [] },
      { isColdStart: true, modelVariant: 'popularity', rank: 3, bookings: [{ id: 'b2' }] },

      // Warm start hybrid - 2 recommendations, 2 bookings (ranks 2 and 5) -> avg booked rank = 3.5
      { isColdStart: false, modelVariant: 'hybrid', rank: 2, bookings: [{ id: 'b3' }] },
      { isColdStart: false, modelVariant: 'hybrid', rank: 5, bookings: [{ id: 'b4' }] },

      // Warm start hybrid - 1 recommendation, 0 bookings -> avg booked rank = null
      { isColdStart: false, modelVariant: 'hybrid', rank: 10, bookings: [] }
    ];

    prisma.recommendationLog.findMany.mockResolvedValue(logs);

    const dateRange = { from: new Date('2023-01-01'), to: new Date('2023-01-31') };
    const result = await computeColdStartBreakdown(prisma, dateRange);

    expect(result).toHaveLength(2); // (true, popularity) and (false, hybrid)

    const coldPopularity = result.find(r => r.isColdStart === true && r.modelVariant === 'popularity');
    expect(coldPopularity?.totalRecommendations).toBe(3);
    expect(coldPopularity?.averageBookedRank).toBe(2.0);

    const warmHybrid = result.find(r => r.isColdStart === false && r.modelVariant === 'hybrid');
    expect(warmHybrid?.totalRecommendations).toBe(3);
    expect(warmHybrid?.averageBookedRank).toBe(3.5);
  });
});
