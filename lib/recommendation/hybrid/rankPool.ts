import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { HybridRequest, computeHybridScores } from "./hybridScore";
import { loadLatestModelCache } from "../collaborative/modelCache";
import { scoreCollaborative } from "../collaborative/collaborativeScore";
import { loadActiveWeights } from "./loadWeights";
import { RankedWorker } from "../../../types/recommendation";
import { getActiveModelVariant } from "../featureFlag";
import { rankRuleBased } from "../ruleBased";
import { rankContentBased } from "../contentBased";

// Helper for pure collaborative
function rankCollaborativeOnly(pool: any[], collabScores: number[], topK: number) {
  const scored = pool.map((worker, i) => ({
    worker,
    score: collabScores[i]
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Orchestrates the full recommendation pipeline for a given request, routing
 * to the appropriate algorithm based on the active feature flag.
 * 
 * @param prisma PrismaClient instance
 * @param request The hybrid recommendation request context
 * @param topK Number of recommendations to return
 * @returns Object containing the ranked workers, the active model variant, and cold start status
 */
export async function rankPool(
  prisma: PrismaClient,
  request: HybridRequest,
  topK = 5
): Promise<{ results: RankedWorker[]; modelVariant: string; isColdStart: boolean }> {
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

  const modelVariant = getActiveModelVariant();

  if (pool.length === 0) return { results: [], modelVariant, isColdStart: true };

  // 2. Load cached collaborative factors
  const factors = await loadLatestModelCache(prisma);

  // 3. Compute collaborative scores (needed by collab-only and hybrid models, and for isColdStart logging)
  const workerIds = pool.map((w) => w.id);
  let collabResult = { scores: new Array(pool.length).fill(0), isWarm: false };
  
  if (factors) {
    collabResult = scoreCollaborative(request.customerId, workerIds, factors);
  }

  let rankedWorkers: RankedWorker[] = [];

  // Route to the appropriate algorithm based on feature flag
  if (modelVariant === "rule_based") {
    const rawRanked = rankRuleBased(pool as any, topK);
    rankedWorkers = rawRanked.map((w, index) => ({
      ...w,
      score: w.rating,
      rank: index + 1,
      scoreBreakdown: { proximity: 0, price: 0, rating: w.rating, tag: 0, collab: 0 },
    })) as RankedWorker[];

  } else if (modelVariant === "content_based") {
    const withTagVectors = pool.map(w => ({
      ...w,
      tagVector: w.skillTags.reduce((acc: Record<string, number>, st: any) => { 
        acc[st.tag] = st.weight; 
        return acc; 
      }, {})
    }));
    const rawRanked = rankContentBased(withTagVectors, request.preferredTags || {}, topK);
    rankedWorkers = rawRanked.map((w, index) => {
      const { tagVector, ...rest } = w;
      return {
        ...rest,
        score: index === 0 ? 1 : 1 / (index + 1), // Proxy score for pure content-based order
        rank: index + 1,
        scoreBreakdown: { proximity: 0, price: 0, rating: 0, tag: 1, collab: 0 },
      } as RankedWorker;
    });

  } else if (modelVariant === "collaborative") {
    const scored = rankCollaborativeOnly(pool, collabResult.scores, topK);
    rankedWorkers = scored.map((item, index) => ({
      ...item.worker,
      score: item.score,
      rank: index + 1,
      scoreBreakdown: { proximity: 0, price: 0, rating: 0, tag: 0, collab: item.score },
    })) as RankedWorker[];

  } else {
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

    rankedWorkers = topWorkers.map((item, index) => {
      return {
        ...item.worker,
        score: item.score,
        rank: index + 1,
        scoreBreakdown: item.breakdown,
        user: item.worker.user,
      } as RankedWorker;
    });
  }

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
        modelVariant,
        isColdStart: !collabResult.isWarm,
        scoreBreakdown: worker.scoreBreakdown as any, // Cast to any to satisfy Prisma Json input
      })),
    });
  }

  return {
    results: rankedWorkers,
    modelVariant,
    isColdStart: !collabResult.isWarm,
  };
}
