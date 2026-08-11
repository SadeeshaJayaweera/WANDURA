import { zScoreNormalize } from '../zscore';

describe('zScoreNormalize', () => {
  it('should normalize a constant array to all zeros', () => {
    const input = [5, 5, 5];
    const expected = [0, 0, 0];
    const result = zScoreNormalize(input);
    expect(result).toEqual(expected);
  });

  it('should normalize a simple array [1, 2, 3] to have a mean of 0', () => {
    const input = [1, 2, 3];
    const result = zScoreNormalize(input);
    
    // Calculate the mean of the normalized array
    const sum = result.reduce((acc, val) => acc + val, 0);
    const mean = sum / result.length;
    
    // Mean should be 0
    expect(mean).toBeCloseTo(0, 5);
  });
});
