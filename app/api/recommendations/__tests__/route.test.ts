import { POST } from "../route";
import { PrismaClient } from "@prisma/client";

// Mock the dependencies
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    workerProfile: {
      findMany: jest.fn(),
    },
    recommendationModelCache: {
      findFirst: jest.fn(),
    },
    recommendationWeightConfig: {
      findFirst: jest.fn(),
    },
    recommendationLog: {
      createMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
    RecommendationVariant: { WARM: "WARM", COLD: "COLD" },
    SkillType: { PLUMBER: "PLUMBER" }
  };
});

describe("POST /api/recommendations", () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = new PrismaClient();
    jest.clearAllMocks();
  });

  it("should return 400 for an invalid body (e.g. lat > 90)", async () => {
    const invalidBody = {
      skill: "PLUMBER",
      lat: 200, // Invalid latitude
      lng: -120,
      budget: 100,
    };

    const request = new Request("http://localhost/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("should return 200 with correctly shaped results for a valid body", async () => {
    // Setup mocked prisma responses to simulate rankPool behavior
    prismaMock.workerProfile.findMany.mockResolvedValue([
      {
        id: "worker-1",
        skill: "PLUMBER",
        isAvailable: true,
        rating: 4.5,
        totalReviews: 10,
        dailyRate: 120,
        latitude: 34.0,
        longitude: -118.0,
        skillTags: [],
        user: {
          id: "user-1",
          name: "Test Plumber",
        },
      }
    ]);

    prismaMock.recommendationModelCache.findFirst.mockResolvedValue(null);
    prismaMock.recommendationWeightConfig.findFirst.mockResolvedValue(null);
    prismaMock.recommendationLog.createMany.mockResolvedValue({ count: 1 });

    const validBody = {
      skill: "PLUMBER",
      lat: 34.05,
      lng: -118.25,
      budget: 150,
      topK: 3,
    };

    const request = new Request("http://localhost/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    
    // Assert exactly what the route returns
    expect(json).toHaveProperty("results");
    expect(json).toHaveProperty("modelVariant");
    expect(json).toHaveProperty("isColdStart");
    
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results.length).toBeGreaterThan(0);
    expect(json.results[0]).toHaveProperty("id", "worker-1");
    expect(json.results[0]).toHaveProperty("rank");
    expect(json.results[0]).toHaveProperty("score");
  });
});
