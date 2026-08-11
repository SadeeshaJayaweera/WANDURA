import { WeightSet } from "./loadWeights";
import { RecommendationRequest } from "../../../types/recommendation";
import { haversineDistanceKm } from "../geo";
import { priceGap } from "../priceFit";
import { cosineSimilarity } from "../tagSimilarity";
import { zScoreNormalize } from "../zscore";
import { ScoreBreakdown } from "../../../types/recommendation";

export interface WorkerCandidate {
  id: string;
  latitude: number | null;
  longitude: number | null;
  dailyRate: number;
  rating: number;
  skillTags: { tag: string; weight: number }[];
}

// Extend base request to include optional preferredTags if needed by the hybrid model
export interface HybridRequest extends RecommendationRequest {
  preferredTags?: Record<string, number>;
}

/**
 * Computes the final hybrid score for a pool of worker candidates.
 * 
 * Follows the paper's design by calculating the raw signals, z-scoring them
 * across the candidate pool, and combining them using the learned weights.
 * 
 * @param pool The candidate workers to rank
 * @param request The user's recommendation request parameters
 * @param collabResult The pre-calculated collaborative (or popularity fallback) scores and warm-start flag
 * @param weights The weight configurations for WARM and COLD variants
 * @returns Object containing final scores and score breakdowns matching the order of the input pool
 */
export function computeHybridScores(
  pool: WorkerCandidate[],
  request: HybridRequest,
  collabResult: { scores: number[]; isWarm: boolean },
  weights: { warm: WeightSet; cold: WeightSet }
): { scores: number[]; breakdowns: ScoreBreakdown[] } {
  if (pool.length === 0) return { scores: [], breakdowns: [] };

  const rawProximity: number[] = [];
  const rawPrice: number[] = [];
  const rawRating: number[] = [];
  const rawTag: number[] = [];
  
  const preferredTags = request.preferredTags || {};

  pool.forEach(worker => {
    // 1. Proximity Signal (Negated because a smaller distance is better)
    if (worker.latitude !== null && worker.longitude !== null) {
      const distance = haversineDistanceKm(
        request.lat,
        request.lng,
        worker.latitude,
        worker.longitude
      );
      rawProximity.push(-distance);
    } else {
      // Penalty for missing location data
      rawProximity.push(-9999);
    }

    // 2. Price Fit Signal (Negated because a smaller price gap is better)
    rawPrice.push(-priceGap(worker.dailyRate, request.budget));

    // 3. Rating Signal
    rawRating.push(worker.rating);

    // 4. Tag Similarity Signal
    const workerTags: Record<string, number> = {};
    for (const st of worker.skillTags) {
      workerTags[st.tag] = st.weight;
    }
    rawTag.push(cosineSimilarity(preferredTags, workerTags));
  });

  // 5. Z-Score Normalization
  // Standardize all signals so they share a comparable mean and variance
  const zProximity = zScoreNormalize(rawProximity);
  const zPrice = zScoreNormalize(rawPrice);
  const zRating = zScoreNormalize(rawRating);
  const zTag = zScoreNormalize(rawTag);
  const zCollab = zScoreNormalize(collabResult.scores);

  // 6. Branch based on Collaborative result (Warm vs Cold start)
  const activeWeights = collabResult.isWarm ? weights.warm : weights.cold;

  // 7. Combine weighted signals and preserve breakdown for explainability
  const finalScores: number[] = [];
  const breakdowns: ScoreBreakdown[] = [];
  
  for (let i = 0; i < pool.length; i++) {
    const proximity = zProximity[i] * activeWeights.proximityWeight;
    const price = zPrice[i] * activeWeights.priceWeight;
    const rating = zRating[i] * activeWeights.ratingWeight;
    const tag = zTag[i] * activeWeights.tagWeight;
    const collab = zCollab[i] * activeWeights.collabWeight;

    const score = proximity + price + rating + tag + collab;

    finalScores.push(score);
    breakdowns.push({
      proximity,
      price,
      rating,
      tag,
      collab,
    });
  }

  return { scores: finalScores, breakdowns };
}
