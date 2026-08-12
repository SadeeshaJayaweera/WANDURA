import fs from 'fs'
import path from 'path'
import { computeTruncatedSVD } from '../../lib/recommendation/collaborative/svd'
import { scoreCollaborative } from '../../lib/recommendation/collaborative/collaborativeScore'
import { computeHybridScores } from '../../lib/recommendation/hybrid/hybridScore'
import { ndcgAtK } from './metrics'

const evalDir = path.join(process.cwd(), 'eval-data')
const workers = JSON.parse(fs.readFileSync(path.join(evalDir, 'workers.json'), 'utf-8'))
const requests = JSON.parse(fs.readFileSync(path.join(evalDir, 'requests.json'), 'utf-8'))

const TOP_K = 5

// 1. Build interaction matrix
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

const baseWeights = { proximityWeight: 0.3, priceWeight: 0.2, ratingWeight: 0.1, tagWeight: 0.2, collabWeight: 0.2 }
const signals = Object.keys(baseWeights) as Array<keyof typeof baseWeights>

const TAGS = ['reliable', 'punctual', 'expert', 'affordable', 'fast', 'friendly', 'tidy', 'polite', 'thorough', 'experienced', 'flexible', 'communicative', 'proactive', 'honest']

// Helper to convert tag array to boolean vector
function toTagVector(tags: string[]) {
  const vec: Record<string, number> = {}
  TAGS.forEach(t => vec[t] = tags.includes(t) ? 1 : 0)
  return vec
}

const results: Record<string, number[]> = { 'Full Hybrid': [] }
for (const signal of signals) {
  results[`No ${signal}`] = []
}

// 3. Run evaluation for full hybrid and each ablated variant
for (const req of requests) {
  const pool = workers.filter((w: any) => w.skill === req.skill)
  
  // Collaborative setup
  const factors = {
    customerIds: Object.keys(customerIndex),
    workerIds: Object.keys(workerIndex),
    customerFactors,
    workerFactors
  }
  const collabResult = scoreCollaborative(req.customerId, pool.map((w: any) => w.id), factors)
  
  // Base request object
  const mappedPool = pool.map((w: any) => ({
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
  }))

  const hybridReq = {
    skill: req.skill,
    lat: req.latitude,
    lng: req.longitude,
    budget: req.budget,
    preferredTags: toTagVector(req.tags),
    customerId: req.customerId
  }

  const evaluateVariant = (name: string, warmWeights: typeof baseWeights) => {
    // We only care about the warm path for this ablation (since we trained on these users)
    const weights = { warm: warmWeights, cold: warmWeights }
    
    const scores = computeHybridScores(mappedPool, hybridReq, collabResult, weights)
    
    const ranked = pool.map((w: any, i: number) => ({ id: w.id, score: scores.scores[i] }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, TOP_K).map((w: any) => w.id)
      
    results[name].push(ndcgAtK(ranked, req.groundTruth, TOP_K))
  }

  // A. Full Hybrid
  evaluateVariant('Full Hybrid', baseWeights)

  // B. Ablated Variants
  for (const signal of signals) {
    const ablatedWeights = { ...baseWeights }
    ablatedWeights[signal] = 0
    
    // Renormalize
    const remainingSum = Object.values(ablatedWeights).reduce((a, b) => a + b, 0)
    for (const key of signals) {
      ablatedWeights[key] = ablatedWeights[key] / remainingSum
    }
    
    evaluateVariant(`No ${signal}`, ablatedWeights)
  }
}

// 4. Output results
console.log('--- Ablation Study (NDCG@5) ---')
for (const [name, ndcgs] of Object.entries(results)) {
  const avgNdcg = ndcgs.reduce((a, b) => a + b, 0) / ndcgs.length
  
  // Calculate relative drop vs Full Hybrid
  const fullHybridAvg = results['Full Hybrid'].reduce((a, b) => a + b, 0) / results['Full Hybrid'].length
  const diff = avgNdcg - fullHybridAvg
  const diffStr = diff >= 0 ? `+${diff.toFixed(4)}` : diff.toFixed(4)
  
  if (name === 'Full Hybrid') {
    console.log(`${name.padEnd(15)}: ${avgNdcg.toFixed(4)} (Baseline)`)
  } else {
    console.log(`${name.padEnd(15)}: ${avgNdcg.toFixed(4)} (Δ ${diffStr})`)
  }
}
