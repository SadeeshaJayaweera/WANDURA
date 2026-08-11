export interface WorkerCandidate {
  rating: number;
  totalReviews: number;
  [key: string]: any;
}

/**
 * Ranks candidates using the rule-based baseline (Table I of the paper).
 * Sorts by rating descending, then totalReviews descending.
 * Matches the current app's existing filter/sort behavior.
 * 
 * @param pool Array of worker candidates
 * @param topK Number of top candidates to return (default: 5)
 * @returns Ranked array of topK worker candidates
 */
export function rankRuleBased(pool: WorkerCandidate[], topK = 5): WorkerCandidate[] {
  return [...pool]
    .sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.totalReviews - a.totalReviews;
    })
    .slice(0, topK);
}
