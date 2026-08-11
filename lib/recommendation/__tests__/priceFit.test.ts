import { priceGap } from '../priceFit';

describe('priceGap', () => {
  it('should return 0 when dailyRate equals budget', () => {
    const budget = 100;
    expect(priceGap(budget, budget)).toBe(0);
  });

  it('should be symmetric around the budget in relative terms', () => {
    const budget = 100;
    const delta = 20;
    
    const gapBelow = priceGap(budget - delta, budget);
    const gapAbove = priceGap(budget + delta, budget);
    
    expect(gapBelow).toBe(gapAbove);
    expect(gapBelow).toBe(0.2); // |80-100| / 100 = 0.2
  });
});
