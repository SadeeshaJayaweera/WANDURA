/**
 * Computes the Wilcoxon signed-rank test for paired samples.
 * Returns the test statistic (W) and asymptotic two-sided p-value.
 */
export function wilcoxonSignedRank(x: number[], y: number[]): { w: number, pValue: number } {
  if (x.length !== y.length) throw new Error("Samples must be paired (same length)")
  
  // 1. Calculate differences
  const diffs = x.map((val, i) => val - y[i])
  
  // 2. Exclude 0 differences
  const nonZeroDiffs = diffs.filter(d => d !== 0)
  const n = nonZeroDiffs.length
  
  if (n === 0) return { w: 0, pValue: 1.0 }
  
  // 3. Sort absolute differences
  const absDiffs = nonZeroDiffs.map(Math.abs).sort((a, b) => a - b)
  
  // 4. Rank absolute differences (handling ties by averaging ranks)
  const ranks = new Map<number, number>()
  let i = 0
  while (i < n) {
    let j = i
    while (j < n && absDiffs[j] === absDiffs[i]) j++
    
    // Ranks are 1-based
    const avgRank = ((i + 1) + j) / 2
    ranks.set(absDiffs[i], avgRank)
    i = j
  }
  
  // 5. Calculate W+ and W-
  let wPlus = 0
  let wMinus = 0
  
  for (const d of nonZeroDiffs) {
    const rank = ranks.get(Math.abs(d))!
    if (d > 0) wPlus += rank
    else wMinus += rank
  }
  
  // 6. Test statistic W
  const w = Math.min(wPlus, wMinus)
  
  // 7. Normal approximation for large N (N > 20 is typical)
  const expectedW = (n * (n + 1)) / 4
  
  // Variance needs tie correction
  let tieCorrection = 0
  const counts = new Map<number, number>()
  for (const absD of absDiffs) {
    counts.set(absD, (counts.get(absD) || 0) + 1)
  }
  for (const count of counts.values()) {
    if (count > 1) {
      tieCorrection += (Math.pow(count, 3) - count) / 48
    }
  }
  
  const varW = (n * (n + 1) * (2 * n + 1)) / 24 - tieCorrection
  
  if (varW === 0) return { w, pValue: 1.0 } // All absolute differences identical, W = expectedW
  
  // 8. Compute Z score and p-value (two-sided)
  // Apply continuity correction of 0.5
  const z = (Math.abs(w - expectedW) - 0.5) / Math.sqrt(varW)
  
  // Approximation of complementary error function for normal CDF
  const pValue = 2 * (1 - normalCDF(Math.abs(z)))
  
  return { w, pValue }
}

// Standard normal cumulative distribution function
function normalCDF(z: number): number {
  const b1 =  0.319381530;
  const b2 = -0.356563782;
  const b3 =  1.781477937;
  const b4 = -1.821255978;
  const b5 =  1.330274429;
  const p  =  0.2316419;
  const c  =  0.39894228;

  if (z >= 0.0) {
      const t = 1.0 / ( 1.0 + p * z );
      return (1.0 - c * Math.exp( -z * z / 2.0 ) * t *
      ( t *( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
  } else {
      const t = 1.0 / ( 1.0 - p * z );
      return ( c * Math.exp( -z * z / 2.0 ) * t *
      ( t *( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
  }
}
