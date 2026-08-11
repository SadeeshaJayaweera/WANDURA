/**
 * Normalizes an array of values using z-score normalization.
 * This matches the _znorm function's behavior from the paper's Python implementation exactly.
 * 
 * @param values Array of numerical values to normalize
 * @returns Array of z-score normalized values, or an array of zeros if standard deviation is ~0
 */
export function zScoreNormalize(values: number[]): number[] {
  if (values.length === 0) {
    return [];
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;

  const squaredDiffSum = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = squaredDiffSum / values.length;
  const std = Math.sqrt(variance);

  if (std < 1e-9) {
    return values.map(() => 0);
  }

  return values.map(v => (v - mean) / (std || 1e-9));
}
