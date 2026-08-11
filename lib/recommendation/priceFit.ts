/**
 * Calculates the price gap between the daily rate and the budget.
 * 
 * Note: A lower value indicates a better fit. This value gets negated
 * before being used in z-scoring for the recommendation model.
 * 
 * @param dailyRate The daily rate of the listing
 * @param budget The user's target budget
 * @returns The price gap score
 */
export function priceGap(dailyRate: number, budget: number): number {
  return Math.abs(dailyRate - budget) / Math.max(budget, 1e-6);
}
