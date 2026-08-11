export interface CollaborativeFactors {
  customerIds: string[];
  workerIds: string[];
  customerFactors: number[][];
  workerFactors: number[][];
}

/**
 * Calculates collaborative filtering scores by computing the dot product between
 * the customer's latent factor vector and the workers' latent factor vectors.
 * 
 * @param customerId The ID of the customer requesting recommendations.
 * @param workerIdsToScore The list of worker IDs to score.
 * @param factors The trained SVD factors and ID mappings.
 * @returns { scores, isWarm } where scores match the order of workerIdsToScore, and isWarm is true if the customer was in the training set.
 */
export function scoreCollaborative(
  customerId: string,
  workerIdsToScore: string[],
  factors: CollaborativeFactors
): { scores: number[]; isWarm: boolean } {
  const { customerIds, workerIds, customerFactors, workerFactors } = factors;
  
  const customerIndex = customerIds.indexOf(customerId);
  
  // If the customer was not in the interaction matrix, this is a cold start
  if (customerIndex === -1) {
    return {
      scores: new Array(workerIdsToScore.length).fill(0),
      isWarm: false,
    };
  }
  
  const customerVec = customerFactors[customerIndex];
  
  // Create a fast lookup map for worker IDs to their index in the factor matrix
  const workerIndexMap = new Map(workerIds.map((id, idx) => [id, idx]));
  
  const scores = workerIdsToScore.map((wId) => {
    const wIdx = workerIndexMap.get(wId);
    
    // If the worker is not in the training matrix (cold worker), their score is 0
    if (wIdx === undefined) {
      return 0;
    }
    
    const workerVec = workerFactors[wIdx];
    
    // Compute the dot product between the customer vector and worker vector
    let dotProduct = 0;
    const len = Math.min(customerVec.length, workerVec.length); // Should be equal (k components)
    
    for (let i = 0; i < len; i++) {
      dotProduct += customerVec[i] * workerVec[i];
    }
    
    return dotProduct;
  });
  
  return {
    scores,
    isWarm: true,
  };
}
