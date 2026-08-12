-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "recommendationLogId" TEXT;

-- CreateIndex
CREATE INDEX "RecommendationLog_workerId_idx" ON "RecommendationLog"("workerId");

-- CreateIndex
CREATE INDEX "RecommendationLog_modelVariant_idx" ON "RecommendationLog"("modelVariant");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_recommendationLogId_fkey" FOREIGN KEY ("recommendationLogId") REFERENCES "RecommendationLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
