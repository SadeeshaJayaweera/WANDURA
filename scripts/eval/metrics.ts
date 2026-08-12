export type GroundTruth = {
  true_top1: string | null;
  true_top2: string | null;
  true_top3: string | null;
};

// Map truth to relevance grades
function getRelevanceGrades(groundTruth: GroundTruth): Record<string, number> {
  const grades: Record<string, number> = {};
  if (groundTruth.true_top1) grades[groundTruth.true_top1] = 3;
  if (groundTruth.true_top2) grades[groundTruth.true_top2] = 2;
  if (groundTruth.true_top3) grades[groundTruth.true_top3] = 1;
  return grades;
}

export function precisionAtK(rankedIds: string[], groundTruth: GroundTruth, k: number): number {
  const topK = rankedIds.slice(0, k);
  const relevantSet = new Set([
    groundTruth.true_top1,
    groundTruth.true_top2,
    groundTruth.true_top3
  ].filter(Boolean));

  if (relevantSet.size === 0) return 1.0; // Edge case: no relevant items

  let hits = 0;
  for (const id of topK) {
    if (relevantSet.has(id)) hits++;
  }
  return hits / k;
}

export function recallAtK(rankedIds: string[], groundTruth: GroundTruth, k: number): number {
  const topK = rankedIds.slice(0, k);
  const relevantSet = new Set([
    groundTruth.true_top1,
    groundTruth.true_top2,
    groundTruth.true_top3
  ].filter(Boolean));

  if (relevantSet.size === 0) return 1.0;

  let hits = 0;
  for (const id of topK) {
    if (relevantSet.has(id)) hits++;
  }
  return hits / relevantSet.size;
}

export function ndcgAtK(rankedIds: string[], groundTruth: GroundTruth, k: number): number {
  const grades = getRelevanceGrades(groundTruth);
  
  // Calculate DCG
  let dcg = 0;
  const topK = rankedIds.slice(0, k);
  for (let i = 0; i < topK.length; i++) {
    const rel = grades[topK[i]] || 0;
    dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2); // (i + 1) + 1 for 1-based log2 formula
  }

  // Calculate IDCG (Ideal DCG)
  // Ideal ranking is sorting the relevant items by their grade descending
  const idealGrades = Object.values(grades).sort((a, b) => b - a).slice(0, k);
  let idcg = 0;
  for (let i = 0; i < idealGrades.length; i++) {
    idcg += (Math.pow(2, idealGrades[i]) - 1) / Math.log2(i + 2);
  }

  if (idcg === 0) return 0.0;
  return dcg / idcg;
}
