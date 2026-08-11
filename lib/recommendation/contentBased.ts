import { cosineSimilarity } from './tagSimilarity';

export interface WorkerCandidate {
  tagVector: Record<string, number>;
  [key: string]: any;
}

/**
 * Ranks candidates using a pure content-based approach based on tag similarity.
 * 
 * @param pool Array of worker candidates with tag vectors
 * @param requestTags The requested tag vector
 * @param topK Number of top candidates to return (default: 5)
 * @returns Ranked array of topK worker candidates
 */
export function rankContentBased<T extends WorkerCandidate>(
  pool: T[], 
  requestTags: Record<string, number>, 
  topK = 5
): T[] {
  return [...pool]
    .sort((a, b) => {
      const scoreA = cosineSimilarity(a.tagVector, requestTags);
      const scoreB = cosineSimilarity(b.tagVector, requestTags);
      return scoreB - scoreA;
    })
    .slice(0, topK);
}
