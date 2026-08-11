import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildInteractionMatrix } from "@/lib/recommendation/collaborative/buildInteractionMatrix";
import { computeTruncatedSVD } from "@/lib/recommendation/collaborative/svd";
import { saveModelCache } from "@/lib/recommendation/collaborative/modelCache";
import { computeSparsityStats } from "@/lib/recommendation/collaborative/sparsityStats";

export async function POST(request: Request) {
  try {
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("x-internal-secret");
    
    const secret = process.env.INTERNAL_JOB_SECRET;

    if (!secret) {
      console.warn("INTERNAL_JOB_SECRET is not set in environment variables");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${secret}` && authHeader !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting collaborative model recomputation via internal API...");

    // 1. Build interaction matrix
    const matrixData = await buildInteractionMatrix(prisma);
    
    const customerCount = matrixData.customerIds.length;
    const workerCount = matrixData.workerIds.length;
    
    // 2. Compute basic stats
    const matrixStats = computeSparsityStats(matrixData.matrix);
    const trainingInteractionCount = matrixStats.nonZeroCells;

    // 3. Compute SVD factors
    const factors = computeTruncatedSVD(matrixData.matrix, 12);
    
    const fullFactors = {
      customerIds: matrixData.customerIds,
      workerIds: matrixData.workerIds,
      customerFactors: factors.customerFactors,
      workerFactors: factors.workerFactors,
    };
    
    const stats = {
      customerCount,
      workerCount,
      trainingInteractionCount,
    };
    
    // 4. Save to cache
    await saveModelCache(prisma, fullFactors, stats);
    
    // 5. Output summary log and respond
    console.log(
      `Recomputed via API: ${trainingInteractionCount} interactions across ${customerCount} customers x ${workerCount} workers, sparsity ${matrixStats.sparsityPct.toFixed(1)}%. Avg interactions/customer: ${matrixStats.avgInteractionsPerCustomer.toFixed(2)}`
    );

    return NextResponse.json({
      success: true,
      stats: {
        customerCount,
        workerCount,
        trainingInteractionCount,
        sparsity: parseFloat(matrixStats.sparsityPct.toFixed(2)),
      }
    });

  } catch (error) {
    console.error("Error recomputing recommendations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
