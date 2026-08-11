import { cosineSimilarity } from '../tagSimilarity';

describe('cosineSimilarity', () => {
  it('should score 1.0 for identical vectors', () => {
    const vec = { tag1: 1, tag2: 0.5 };
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1.0, 5);
  });

  it('should score 0.0 for orthogonal (disjoint-key) vectors', () => {
    const vec1 = { tag1: 1, tag2: 0.5 };
    const vec2 = { tag3: 1, tag4: 0.5 };
    expect(cosineSimilarity(vec1, vec2)).toBe(0.0);
  });

  it('should score 0.0 for an empty vector without throwing', () => {
    const vec1 = { tag1: 1, tag2: 0.5 };
    const emptyVec = {};
    expect(cosineSimilarity(vec1, emptyVec)).toBe(0.0);
    expect(cosineSimilarity(emptyVec, vec1)).toBe(0.0);
    expect(cosineSimilarity(emptyVec, emptyVec)).toBe(0.0);
  });
});
