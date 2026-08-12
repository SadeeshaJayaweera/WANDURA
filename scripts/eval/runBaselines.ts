import fs from 'fs'
import path from 'path'
import { computeTruncatedSVD } from '../../lib/recommendation/collaborative/svd'
import { scoreCollaborative } from '../../lib/recommendation/collaborative/collaborativeScore'
import { rankRuleBased, WorkerCandidate as RuleCandidate } from '../../lib/recommendation/ruleBased'
import { rankContentBased, WorkerCandidate as ContentCandidate } from '../../lib/recommendation/contentBased'
import { computeHybridScores } from '../../lib/recommendation/hybrid/hybridScore'
import { ndcgAtK, precisionAtK, recallAtK } from './metrics'

const evalDir = path.join(process.cwd(), 'eval-data')
const workers = JSON.parse(fs.readFileSync(path.join(evalDir, 'workers.json'), 'utf-8'))
const requests = JSON.parse(fs.readFileSync(path.join(evalDir, 'requests.json'), 'utf-8'))

const TOP_K = 5

// 1. Build interaction matrix for Collaborative Filtering
// Customers who "booked" their true top-1 give it a 5-star rating in the training set
const customerIndex: Record<string, number> = {}
const workerIndex: Record<string, number> = {}
let cIdx = 0, wIdx = 0

requests.forEach((req: any) => {
  if (customerIndex[req.customerId] === undefined) customerIndex[req.customerId] = cIdx++
})
workers.forEach((w: any) => {
  if (workerIndex[w.id] === undefined) workerIndex[w.id] = wIdx++
})

const matrix: number[][] = Array.from({ length: cIdx }, () => Array(wIdx).fill(0))

requests.forEach((req: any) => {
  const c = customerIndex[req.customerId]
  if (req.groundTruth.true_top1) {
    const w = workerIndex[req.groundTruth.true_top1]
    if (w !== undefined) matrix[c][w] = 5
  }
})

// 2. Compute SVD
const { customerFactors, workerFactors } = computeTruncatedSVD(matrix, 12)

const results = {
  ruleBased: { ndcg: [] as number[], precision: [] as number[], recall: [] as number[] },
  contentBased: { ndcg: [] as number[], precision: [] as number[], recall: [] as number[] },
  collaborative: { ndcg: [] as number[], precision: [] as number[], recall: [] as number[] },
  hybrid: { ndcg: [] as number[], precision: [] as number[], recall: [] as number[] },
}

const TAGS = ['reliable', 'punctual', 'expert', 'affordable', 'fast', 'friendly', 'tidy', 'polite', 'thorough', 'experienced', 'flexible', 'communicative', 'proactive', 'honest']

// Helper to convert tag array to boolean vector
function toTagVector(tags: string[]) {
  const vec: Record<string, number> = {}
  TAGS.forEach(t => vec[t] = tags.includes(t) ? 1 : 0)
  return vec
}

// 3. Evaluate each request
for (const req of requests) {
  const pool = workers.filter((w: any) => w.skill === req.skill)
  
  // A. Rule-Based
  const ruleTopK = rankRuleBased(pool, TOP_K).map(w => w.id)
  
  // B. Content-Based
  const reqTagVec = toTagVector(req.tags)
  const contentPool = pool.map((w: any) => ({ ...w, tagVector: toTagVector(w.tags) }))
  const contentTopK = rankContentBased(contentPool, reqTagVec, TOP_K).map(w => w.id)
  
  // C. Collaborative
  const factors = {
    customerIds: Object.keys(customerIndex),
    workerIds: Object.keys(workerIndex),
    customerFactors,
    workerFactors
  }
  const collabResult = scoreCollaborative(req.customerId, pool.map((w: any) => w.id), factors)
  const collabScores = collabResult.scores
  
  const collabRanked = pool.map((w: any, i: number) => ({ id: w.id, score: collabScores[i] }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, TOP_K).map((w: any) => w.id)
    
    // D. Hybrid
  const weights = {
    warm: { proximityWeight: 0.3, priceWeight: 0.2, ratingWeight: 0.1, tagWeight: 0.2, collabWeight: 0.2 },
    cold: { proximityWeight: 0.4, priceWeight: 0.3, ratingWeight: 0.1, tagWeight: 0.2, collabWeight: 0.0 }
  }
  
    const hybridScores = computeHybridScores(
    pool.map((w: any) => ({
      userId: w.id,
      city: 'Colombo',
      state: 'WP',
      latitude: w.latitude,
      longitude: w.longitude,
      dailyRate: w.dailyRate,
      rating: w.rating,
      totalReviews: w.totalReviews,
      skillTags: w.tags.map((t: string) => ({ tag: t, weight: 1 })),
      isVerified: true
    })),
    {
      skill: req.skill,
      lat: req.latitude,
      lng: req.longitude,
      budget: req.budget,
      preferredTags: toTagVector(req.tags),
      customerId: req.customerId
    },
    collabResult,
    weights
  )
  
  const hybridRanked = pool.map((w: any, i: number) => ({ id: w.id, score: hybridScores.scores[i] }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, TOP_K).map((w: any) => w.id)
    
  // Evaluate
  const gt = req.groundTruth
  
  const evaluateArm = (arm: keyof typeof results, ranked: string[]) => {
    results[arm].ndcg.push(ndcgAtK(ranked, gt, TOP_K))
    results[arm].precision.push(precisionAtK(ranked, gt, TOP_K))
    results[arm].recall.push(recallAtK(ranked, gt, TOP_K))
  }
  
  evaluateArm('ruleBased', ruleTopK)
  evaluateArm('contentBased', contentTopK)
  evaluateArm('collaborative', collabRanked)
  evaluateArm('hybrid', hybridRanked)
}

// 4. Output results
console.log('--- Baseline Evaluation (K=5) ---')
for (const [arm, metrics] of Object.entries(results)) {
  const avgNdcg = metrics.ndcg.reduce((a, b) => a + b, 0) / metrics.ndcg.length
  const avgPrec = metrics.precision.reduce((a, b) => a + b, 0) / metrics.precision.length
  const avgRecall = metrics.recall.reduce((a, b) => a + b, 0) / metrics.recall.length
  
  console.log(`${arm.toUpperCase()}:`)
  console.log(`  NDCG@5:      ${avgNdcg.toFixed(4)}`)
  console.log(`  Precision@5: ${avgPrec.toFixed(4)}`)
  console.log(`  Recall@5:    ${avgRecall.toFixed(4)}`)
}
