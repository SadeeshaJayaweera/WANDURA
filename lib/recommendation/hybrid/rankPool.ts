import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { HybridRequest, computeHybridScores } from "./hybridScore";
import { loadLatestModelCache } from "../collaborative/modelCache";
import { scoreCollaborative } from "../collaborative/collaborativeScore";
import { loadActiveWeights } from "./loadWeights";
import { RankedWorker } from "../../../types/recommendation";

/**
 * Orchestrates the full hybrid recommendation pipeline for a given request.
 * 
 * 1. Fetches the initial qualified pool (matching skill and availability)
 * 2. Loads cached collaborative factors and configurations
 * 3. Calculates individual collaborative scores
 * 4. Merges signals into a final hybrid score
 * 5. Returns the top K ranked workers
 * 
 * @param prisma PrismaClient instance
 * @param request The hybrid recommendation request context
 * @param topK Number of recommendations to return
 * @returns Array of RankedWorker items
 */
export async function rankPool(
  prisma: PrismaClient,
  request: HybridRequest,
  topK = 5
): Promise<RankedWorker[]> {
  // 1. Fetch the qualified pool (matching skill + isAvailable=true)
  const pool = await prisma.workerProfile.findMany({
    where: {
      skill: request.skill,
      isAvailable: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        }
      },
      skillTags: true,
    },
  });

  if (pool.length === 0) return [];

  // 2. Load cached collaborative factors
  const factors = await loadLatestModelCache(prisma);

  // 3. Compute collaborative scores
  const workerIds = pool.map((w) => w.id);
  let collabResult = { scores: new Array(pool.length).fill(0), isWarm: false };
  
  if (factors) {
    collabResult = scoreCollaborative(request.customerId, workerIds, factors);
  }

  // 4. Load weights
  const weights = await loadActiveWeights(prisma);

  // 5. Compute hybrid scores and breakdown
  const { scores, breakdowns } = computeHybridScores(pool, request, collabResult, weights);

  // Combine into a sortable array
  const scoredPool = pool.map((worker, index) => {
    return {
      worker,
      score: scores[index],
      breakdown: breakdowns[index],
    };
  });

  // 6. Sort descending
  scoredPool.sort((a, b) => b.score - a.score);

  // 7. Take top K and assign rank
  const topWorkers = scoredPool.slice(0, topK);

  const rankedWorkers = topWorkers.map((item, index) => {
    return {
      ...item.worker,
      score: item.score,
      rank: index + 1,
      scoreBreakdown: item.breakdown,
      user: item.worker.user,
    } as RankedWorker;
  });

  // 8. Log the recommendations to the database
  const requestId = request.requestId || crypto.randomUUID();
  if (rankedWorkers.length > 0) {
    await prisma.recommendationLog.createMany({
      data: rankedWorkers.map((worker) => ({
        requestId,
        customerId: request.customerId,
        workerId: worker.id,
        rank: worker.rank,
        score: worker.score,
        modelVariant: "hybrid",
        isColdStart: !collabResult.isWarm,
        scoreBreakdown: worker.scoreBreakdown as any, // Cast to any to satisfy Prisma Json input
      })),
    });
  }

  return rankedWorkers;
}
