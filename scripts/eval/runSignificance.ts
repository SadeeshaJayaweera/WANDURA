import fs from 'fs'
import path from 'path'
import { wilcoxonSignedRank } from './wilcoxon'

const evalDir = path.join(process.cwd(), 'eval-results')
const baselinesPath = path.join(evalDir, 'baselines.json')

if (!fs.existsSync(baselinesPath)) {
  console.error("baselines.json not found. Run runBaselines.ts first.")
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(baselinesPath, 'utf-8'))
const perRequest = data.perRequest

const hybridNdcg = perRequest.hybrid.ndcg
const baselines = ['ruleBased', 'contentBased', 'collaborative']

console.log('--- Statistical Significance Test (Wilcoxon Signed-Rank) ---')
console.log('Hypothesis: Hybrid model NDCG@5 > Baseline NDCG@5')

const summary: Record<string, any> = {}

for (const baseline of baselines) {
  const baselineNdcg = perRequest[baseline].ndcg
  
  const { w, pValue } = wilcoxonSignedRank(hybridNdcg, baselineNdcg)
  
  // Is significant if p < 0.05
  const isSignificant = pValue < 0.05
  
  summary[baseline] = { w, pValue, isSignificant }
  
  console.log(`\nHybrid vs ${baseline.toUpperCase()}:`)
  console.log(`  W-statistic : ${w}`)
  console.log(`  p-value     : ${pValue.toExponential(4)}`)
  console.log(`  Significant : ${isSignificant ? 'Yes (p < 0.05)' : 'No'}`)
}

fs.writeFileSync(
  path.join(evalDir, 'significance.json'),
  JSON.stringify({ summary }, null, 2)
)
