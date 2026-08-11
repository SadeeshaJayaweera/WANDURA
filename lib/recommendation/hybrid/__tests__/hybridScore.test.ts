import { computeHybridScores, WorkerCandidate, HybridRequest } from "../hybridScore";
import { WeightSet } from "../loadWeights";
import { SkillType } from "@prisma/client";

describe("computeHybridScores", () => {
  const mockRequest: HybridRequest = {
    skill: SkillType.PLUMBER,
    lat: 10.0,
    lng: 10.0,
    budget: 100,
    customerId: "c1",
    preferredTags: { fast: 1.0 },
  };

  const pool: WorkerCandidate[] = [
    {
      id: "wA",
      latitude: 10.01,
      longitude: 10.01,
      dailyRate: 100,
      rating: 4.5,
      skillTags: [{ tag: "fast", weight: 1.0 }],
    },
    {
      id: "wB",
      // Identical raw baseline stats to wA
      latitude: 10.01,
      longitude: 10.01,
      dailyRate: 100,
      rating: 4.5,
      skillTags: [{ tag: "fast", weight: 1.0 }],
    },
    {
      id: "wC",
      // Terribly unfit baseline stats
      latitude: 15.0,
      longitude: 15.0,
      dailyRate: 500,
      rating: 2.0,
      skillTags: [{ tag: "slow", weight: 1.0 }],
    }
  ];

  const weights = {
    warm: {
      proximityWeight: 0.1,
      priceWeight: 0.1,
      ratingWeight: 0.1,
      tagWeight: 0.1,
      collabWeight: 0.6, // High collab weight
    } as WeightSet,
    cold: {
      proximityWeight: 0.25,
      priceWeight: 0.25,
      ratingWeight: 0.25,
      tagWeight: 0.25,
      collabWeight: 0.0, // Zero collab weight
    } as WeightSet,
  };

  it("should heavily influence ranking with the collaborative signal when isWarm=true", () => {
    // wA is heavily favored by the collab model over wB
    const collabResult = { scores: [10, -5, 0], isWarm: true };

    const { scores, breakdowns } = computeHybridScores(pool, mockRequest, collabResult, weights);

    // Because they have identical raw baseline stats, their baseline Z-scores are identical.
    // However, collab score Z-scores will differ massively.
    expect(scores[0]).toBeGreaterThan(scores[1]); // wA > wB
    expect(scores[1]).toBeGreaterThan(scores[2]); // wB > wC (due to baseline stats carrying some weight)

    // Verify breakdown proves it was the collab factor driving the difference
    expect(breakdowns[0].collab).toBeGreaterThan(breakdowns[1].collab);
  });

  it("should gracefully degrade to baseline signals when isWarm=false (collab weight=0)", () => {
    // Same collab raw scores, but the model shouldn't use them (cold start fallback)
    const collabResult = { scores: [10, -5, 0], isWarm: false };

    const { scores, breakdowns } = computeHybridScores(pool, mockRequest, collabResult, weights);

    // Without the collab signal, wA and wB are completely identical.
    expect(scores[0]).toBeCloseTo(scores[1], 4);

    // Both should still strongly outrank wC due to valid baseline scoring
    expect(scores[0]).toBeGreaterThan(scores[2]);
    expect(scores[1]).toBeGreaterThan(scores[2]);

    // Verify breakdown proves collab contributed exactly 0
    expect(breakdowns[0].collab).toBeCloseTo(0, 5);
    expect(breakdowns[1].collab).toBeCloseTo(0, 5);
    expect(breakdowns[2].collab).toBeCloseTo(0, 5);
  });
});
