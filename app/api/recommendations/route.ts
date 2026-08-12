import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { recommendationRequestSchema } from "@/lib/validations";
import { rankPool } from "@/lib/recommendation/hybrid/rankPool";
import { HybridRequest } from "@/lib/recommendation/hybrid/hybridScore";
import { recommendationCache } from "@/lib/recommendation/requestCache";

const prisma = new PrismaClient();

/**
 * POST /api/recommendations
 * 
 * Computes a list of recommended workers based on the active ML model variant
 * (hybrid, rule_based, content_based, collaborative).
 * 
 * @param request HTTP POST request with JSON body
 * @returns JSON response matching `{ results: RankedWorker[], modelVariant: string, isColdStart: boolean }`
 * 
 * @body
 * - `skill`: `SkillType` (e.g. "PLUMBER")
 * - `lat`: `number` (latitude, -90 to 90)
 * - `lng`: `number` (longitude, -180 to 180)
 * - `budget`: `number` (positive)
 * - `topK`: `number` (optional, default 5, min 1, max 20)
 * - `customerId`: `string` (optional, falls back to "anonymous" for cold-start testing)
 * 
 * @throws 400 `VALIDATION_ERROR` if the request payload violates the schema
 * @throws 500 `INTERNAL_SERVER_ERROR` if unexpected failures occur during pipeline execution
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Parse and validate the request body against our schema
    const parsed = recommendationRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: "Invalid request payload", 
          code: "VALIDATION_ERROR",
          details: parsed.error.format() 
        },
        { status: 400 }
      );
    }

    const { skill, lat, lng, budget, customerId, topK } = parsed.data;

    // Transform into the internal HybridRequest
    const hybridReq: HybridRequest = {
      skill,
      lat,
      lng,
      budget,
      // Map missing customer IDs to an anonymous fallback (triggers cold-start path)
      customerId: customerId || "anonymous",
    };

    // Check Cache First
    const cachedResponse = recommendationCache.get(parsed.data);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    // 2. Execute the recommendation pipeline
    const response = await rankPool(prisma, hybridReq, topK);

    // 3. Handle empty pool gracefully
    if (response.results.length === 0) {
      const emptyPayload = {
        ...response,
        reason: "NO_QUALIFIED_WORKERS"
      };
      // Don't aggressively cache empty hits, but valid to return
      return NextResponse.json(emptyPayload, { status: 200 });
    }

    // Cache the successful populated response
    recommendationCache.set(parsed.data, response);

    // 4. Return JSON payload matching { results, modelVariant, isColdStart }
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while generating recommendations.",
        code: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}
