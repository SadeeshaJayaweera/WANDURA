import { PrismaClient, RecommendationVariant } from "@prisma/client";

export interface WeightSet {
  proximityWeight: number;
  priceWeight: number;
  ratingWeight: number;
  tagWeight: number;
  collabWeight: number;
}

// Module-scoped cache
let cachedWeights: { warm: WeightSet; cold: WeightSet } | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Loads the currently active RecommendationWeightConfig for both WARM and COLD variants.
 * Results are cached in module scope for 5 minutes to avoid a DB round-trip on every request.
 */
export async function loadActiveWeights(
  prisma: PrismaClient
): Promise<{ warm: WeightSet; cold: WeightSet }> {
  const now = Date.now();
  
  // Return cached weights if they exist and are within TTL
  if (cachedWeights && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedWeights;
  }

  // Fetch both variants concurrently
  const [warmConfig, coldConfig] = await Promise.all([
    prisma.recommendationWeightConfig.findFirst({
      where: { variant: RecommendationVariant.WARM, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.recommendationWeightConfig.findFirst({
      where: { variant: RecommendationVariant.COLD, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Default fallbacks in case DB is unseeded
  const defaultWarm: WeightSet = {
    proximityWeight: 0.1,
    priceWeight: 0.2,
    ratingWeight: 0.1,
    tagWeight: 0.2,
    collabWeight: 0.4,
  };

  const defaultCold: WeightSet = {
    proximityWeight: 0.2,
    priceWeight: 0.3,
    ratingWeight: 0.2,
    tagWeight: 0.3,
    collabWeight: 0.0,
  };

  cachedWeights = {
    warm: warmConfig
      ? {
          proximityWeight: warmConfig.proximityWeight,
          priceWeight: warmConfig.priceWeight,
          ratingWeight: warmConfig.ratingWeight,
          tagWeight: warmConfig.tagWeight,
          collabWeight: warmConfig.collabWeight,
        }
      : defaultWarm,
    cold: coldConfig
      ? {
          proximityWeight: coldConfig.proximityWeight,
          priceWeight: coldConfig.priceWeight,
          ratingWeight: coldConfig.ratingWeight,
          tagWeight: coldConfig.tagWeight,
          collabWeight: coldConfig.collabWeight,
        }
      : defaultCold,
  };

  lastCacheTime = now;
  return cachedWeights;
}
