import { scoreCollaborative, CollaborativeFactors } from "../collaborativeScore";

describe("scoreCollaborative", () => {
  // Hand-built 3x4 interaction matrix representation (using 2 latent components)
  const mockFactors: CollaborativeFactors = {
    customerIds: ["c1", "c2", "c3"],
    workerIds: ["w1", "w2", "w3", "w4"],
    customerFactors: [
      [1, 2], // c1
      [3, 4], // c2
      [5, 6], // c3
    ],
    workerFactors: [
      [1, 1],   // w1
      [0, 2],   // w2
      [2, 0],   // w3
      [1, -1],  // w4
    ],
  };

  it("should return isWarm=true and correctly computed dot products for a known customer", () => {
    const workerIdsToScore = ["w1", "w2", "w3", "w4"];
    
    // For c1: [1, 2]
    // w1: (1*1) + (2*1)  = 3
    // w2: (1*0) + (2*2)  = 4
    // w3: (1*2) + (2*0)  = 2
    // w4: (1*1) + (2*-1) = -1
    
    const result = scoreCollaborative("c1", workerIdsToScore, mockFactors);

    expect(result.isWarm).toBe(true);
    expect(result.scores).toEqual([3, 4, 2, -1]);
    
    // Validate relative order directly
    const scores = result.scores;
    expect(scores[1]).toBeGreaterThan(scores[0]); // w2 > w1
    expect(scores[0]).toBeGreaterThan(scores[2]); // w1 > w3
    expect(scores[2]).toBeGreaterThan(scores[3]); // w3 > w4
  });

  it("should return isWarm=false and an array of zeros for an unknown customer (cold start)", () => {
    const workerIdsToScore = ["w1", "w2", "w3", "w4"];
    const result = scoreCollaborative("cold-customer", workerIdsToScore, mockFactors);

    expect(result.isWarm).toBe(false);
    expect(result.scores).toEqual([0, 0, 0, 0]);
  });

  it("should handle unknown workers by returning a score of 0 for them", () => {
    // w99 is not in the training matrix
    const workerIdsToScore = ["w1", "w99", "w2"];
    
    // For c2: [3, 4]
    // w1: (3*1) + (4*1) = 7
    // w99: unknown -> 0
    // w2: (3*0) + (4*2) = 8
    
    const result = scoreCollaborative("c2", workerIdsToScore, mockFactors);

    expect(result.isWarm).toBe(true);
    expect(result.scores).toEqual([7, 0, 8]);
  });
});
