import { PrismaClient } from "@prisma/client";
import { buildInteractionMatrix } from "../lib/recommendation/collaborative/buildInteractionMatrix";
import { computeTruncatedSVD } from "../lib/recommendation/collaborative/svd";
import { saveModelCache } from "../lib/recommendation/collaborative/modelCache";
import { computeSparsityStats } from "../lib/recommendation/collaborative/sparsityStats";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting collaborative model recomputation...");
  
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
  
  // 5. Output summary log
  console.log(
    `Recomputed: ${trainingInteractionCount} interactions across ${customerCount} customers x ${workerCount} workers, sparsity ${matrixStats.sparsityPct.toFixed(1)}%. Avg interactions/customer: ${matrixStats.avgInteractionsPerCustomer.toFixed(2)}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
