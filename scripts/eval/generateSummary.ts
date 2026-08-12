import fs from 'fs'
import path from 'path'

const evalDir = path.join(process.cwd(), 'eval-results')
const baselinesPath = path.join(evalDir, 'baselines.json')
const ablationPath = path.join(evalDir, 'ablation.json')
const significancePath = path.join(evalDir, 'significance.json')

if (!fs.existsSync(baselinesPath) || !fs.existsSync(ablationPath) || !fs.existsSync(significancePath)) {
  console.error("Missing JSON results. Run eval suite first.")
  process.exit(1)
}

const baselines = JSON.parse(fs.readFileSync(baselinesPath, 'utf-8')).summary
const ablation = JSON.parse(fs.readFileSync(ablationPath, 'utf-8')).summary
const significance = JSON.parse(fs.readFileSync(significancePath, 'utf-8')).summary

let md = `# Recommendation Engine Evaluation Summary\n\n`

md += `## Table I: Baseline Comparisons (K=5)\n`
md += `| Model | NDCG@5 | Precision@5 | Recall@5 |\n`
md += `|-------|--------|-------------|----------|\n`
for (const [arm, m] of Object.entries(baselines)) {
  const m2 = m as any
  md += `| ${arm.toUpperCase()} | ${m2.ndcg.toFixed(4)} | ${m2.precision.toFixed(4)} | ${m2.recall.toFixed(4)} |\n`
}
md += `\n`

md += `## Significance Testing (Hybrid vs Baselines)\n`
md += `*Wilcoxon signed-rank test on paired NDCG@5 scores.*\n\n`
md += `| Baseline | W-statistic | p-value | Significant (p<0.05) |\n`
md += `|----------|-------------|---------|----------------------|\n`
for (const [baseline, m] of Object.entries(significance)) {
  const m2 = m as any
  md += `| ${baseline.toUpperCase()} | ${m2.w} | ${m2.pValue.toExponential(4)} | ${m2.isSignificant ? 'Yes' : 'No'} |\n`
}
md += `\n`

md += `## Table III: Ablation Study (NDCG@5)\n`
md += `| Variant | NDCG@5 | Δ vs Full Hybrid |\n`
md += `|---------|--------|------------------|\n`
for (const [variant, m] of Object.entries(ablation)) {
  const m2 = m as any
  const diffStr = m2.diff >= 0 ? `+${m2.diff.toFixed(4)}` : m2.diff.toFixed(4)
  md += `| ${variant} | ${m2.avgNdcg.toFixed(4)} | ${variant === 'Full Hybrid' ? 'Baseline' : diffStr} |\n`
}
md += `\n`

fs.writeFileSync(path.join(evalDir, 'summary.md'), md)
console.log("Wrote eval-results/summary.md")
