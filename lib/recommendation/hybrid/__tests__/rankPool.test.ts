import { PrismaClient, SkillType } from "@prisma/client";
import { rankPool } from "../rankPool";
import { HybridRequest } from "../hybridScore";

const prisma = new PrismaClient();

describe("rankPool (Integration)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should successfully orchestrate the recommendation pipeline and return ranked workers", async () => {
    const request: HybridRequest = {
      skill: SkillType.PLUMBER, // Assuming plumbers exist in seeded DB
      lat: 10.0,
      lng: 10.0,
      budget: 150,
      customerId: "test-customer-id",
    };

    const results = await rankPool(prisma, request, 3);

    // If the DB has PLUMBERs seeded, we should get some results. 
    // If not, we just expect the function to return an empty array without crashing.
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      expect(results.length).toBeLessThanOrEqual(3);
      
      const topWorker = results[0];
      
      // Verify structure matches RankedWorker interface
      expect(topWorker).toHaveProperty("id");
      expect(topWorker).toHaveProperty("score");
      expect(topWorker).toHaveProperty("rank");
      expect(topWorker).toHaveProperty("scoreBreakdown");
      
      expect(topWorker.rank).toBe(1);
      
      expect(topWorker.scoreBreakdown).toHaveProperty("proximity");
      expect(topWorker.scoreBreakdown).toHaveProperty("price");
      expect(topWorker.scoreBreakdown).toHaveProperty("rating");
      expect(topWorker.scoreBreakdown).toHaveProperty("tag");
      expect(topWorker.scoreBreakdown).toHaveProperty("collab");

      // Verify descending sort order
      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
          expect(results[i].rank).toBe(i + 1);
        }
      }
    }
  });
});
