import { PrismaClient } from "@prisma/client";
import { CollaborativeFactors } from "./collaborativeScore";

export interface ModelStats {
  customerCount: number;
  workerCount: number;
  trainingInteractionCount: number;
}

const MODEL_TYPE = "SVD_COLLABORATIVE";

/**
 * Saves the trained collaborative filtering factors into the database cache.
 * 
 * @param prisma PrismaClient instance
 * @param factors The trained customer and worker factors and IDs
 * @param stats Statistics about the training data
 */
export async function saveModelCache(
  prisma: PrismaClient,
  factors: CollaborativeFactors,
  stats: ModelStats
) {
  // Prisma's Json field accepts valid JSON objects. We cast to 'any' to bypass strict
  // Prisma InputJsonValue typings while passing our cleanly typed interface.
  return await prisma.recommendationModelCache.create({
    data: {
      modelType: MODEL_TYPE,
      serializedFactors: factors as any,
      customerCount: stats.customerCount,
      workerCount: stats.workerCount,
      trainingInteractionCount: stats.trainingInteractionCount,
    },
  });
}

/**
 * Loads the most recent collaborative filtering model cache from the database.
 * 
 * @param prisma PrismaClient instance
 * @returns The typed CollaborativeFactors or null if no cache exists
 */
export async function loadLatestModelCache(
  prisma: PrismaClient
): Promise<CollaborativeFactors | null> {
  const latest = await prisma.recommendationModelCache.findFirst({
    where: {
      modelType: MODEL_TYPE,
    },
    orderBy: {
      computedAt: "desc",
    },
  });

  if (!latest) {
    return null;
  }

  // Deserialize the JSON field back into our typed structure.
  // Prisma automatically parses JSON fields into JavaScript objects, but we
  // handle stringified cases just to be defensive.
  let parsedFactors = latest.serializedFactors;
  
  if (typeof parsedFactors === "string") {
    parsedFactors = JSON.parse(parsedFactors);
  }

  return parsedFactors as CollaborativeFactors;
}
