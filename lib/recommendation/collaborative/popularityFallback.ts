export interface InteractionMatrixData {
  customerIds: string[];
  workerIds: string[];
  matrix: number[][];
}

/**
 * Computes a popularity fallback score for workers, which is their mean
 * rating across all customers who booked them.
 * This is used for cold-start customers who do not have enough interaction history
 * for collaborative filtering.
 * 
 * @param workerIdsToScore The list of worker IDs to score.
 * @param interactionData The customer-worker interaction matrix data.
 * @returns An array of popularity scores corresponding to the workerIdsToScore.
 */
export function popularityScore(
  workerIdsToScore: string[],
  interactionData: InteractionMatrixData
): number[] {
  const { workerIds, matrix } = interactionData;
  const numCustomers = matrix.length;
  
  // Create a fast lookup map for worker IDs to their column index
  const workerIndexMap = new Map(workerIds.map((id, idx) => [id, idx]));
  
  return workerIdsToScore.map((wId) => {
    const wIdx = workerIndexMap.get(wId);
    
    // If the worker has no data in the interaction matrix, their popularity is 0
    if (wIdx === undefined) {
      return 0;
    }
    
    let sum = 0;
    let count = 0;
    
    // Calculate mean rating across all customers
    for (let i = 0; i < numCustomers; i++) {
      const rating = matrix[i][wIdx];
      
      // Assuming non-zero ratings represent an interaction
      if (rating > 0) {
        sum += rating;
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0;
  });
}
