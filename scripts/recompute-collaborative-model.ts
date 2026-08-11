import { PrismaClient } from "@prisma/client";
import { buildInteractionMatrix } from "../lib/recommendation/collaborative/buildInteractionMatrix";
import { computeTruncatedSVD } from "../lib/recommendation/collaborative/svd";
import { saveModelCache } from "../lib/recommendation/collaborative/modelCache";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting collaborative model recomputation...");
  
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
  
  // 5. Output summary log
  const totalPossible = customerCount * workerCount;
  let sparsity = 100;
  if (totalPossible > 0) {
    sparsity = ((totalPossible - trainingInteractionCount) / totalPossible) * 100;
  }
  
  console.log(
    `Recomputed: ${trainingInteractionCount} interactions across ${customerCount} customers x ${workerCount} workers, sparsity ${sparsity.toFixed(1)}%`
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
