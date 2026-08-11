import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildInteractionMatrix } from "@/lib/recommendation/collaborative/buildInteractionMatrix";
import { computeTruncatedSVD } from "@/lib/recommendation/collaborative/svd";
import { saveModelCache } from "@/lib/recommendation/collaborative/modelCache";

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
    let trainingInteractionCount = 0;
    for (let i = 0; i < customerCount; i++) {
      for (let j = 0; j < workerCount; j++) {
        if (matrixData.matrix[i][j] > 0) {
          trainingInteractionCount++;
        }
      }
    }

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
    const totalPossible = customerCount * workerCount;
    let sparsity = 100;
    if (totalPossible > 0) {
      sparsity = ((totalPossible - trainingInteractionCount) / totalPossible) * 100;
    }
    
    console.log(
      `Recomputed via API: ${trainingInteractionCount} interactions across ${customerCount} customers x ${workerCount} workers, sparsity ${sparsity.toFixed(1)}%`
    );

    return NextResponse.json({
      success: true,
      stats: {
        customerCount,
        workerCount,
        trainingInteractionCount,
        sparsity: parseFloat(sparsity.toFixed(2)),
      }
    });

  } catch (error) {
    console.error("Error recomputing recommendations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
