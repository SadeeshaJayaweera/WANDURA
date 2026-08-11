/**
 * Calculates the cosine similarity between two weighted tag vectors.
 * This represents the content-based signal in the hybrid recommendation model.
 * 
 * @param a The first tag vector (e.g., user preferences)
 * @param b The second tag vector (e.g., listing attributes)
 * @returns A similarity score between 0 and 1, or 0 if either vector is all zero
 */
export function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  let dotProduct = 0;
  let normASq = 0;
  let normBSq = 0;

  for (const key of keys) {
    const valA = a[key] || 0;
    const valB = b[key] || 0;

    dotProduct += valA * valB;
    normASq += valA * valA;
    normBSq += valB * valB;
  }

  if (normASq === 0 || normBSq === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normASq) * Math.sqrt(normBSq));
}
