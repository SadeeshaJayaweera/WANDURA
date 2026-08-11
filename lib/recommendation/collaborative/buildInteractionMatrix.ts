import { PrismaClient } from "@prisma/client";

export async function buildInteractionMatrix(prisma: PrismaClient) {
  // 1. Query completed bookings and include the worker's profile
  // Booking.workerId references User.id, so we join through User to get WorkerProfile
  const completedBookings = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      worker: {
        workerProfile: {
          isNot: null,
        },
      },
    },
    include: {
      worker: {
        include: {
          workerProfile: true,
        },
      },
    },
  });

  const bookingIds = completedBookings.map((b) => b.id);

  // 2. Query reviews that match these booking IDs
  // (Manual two-step query since Review has no formal relation to Booking)
  const reviews = await prisma.review.findMany({
    where: {
      bookingId: {
        in: bookingIds,
      },
    },
  });

  // Extract unique customers and workers
  const customerIdsSet = new Set<string>();
  const workerIdsSet = new Set<string>();

  for (const b of completedBookings) {
    customerIdsSet.add(b.customerId);
    if (b.worker.workerProfile) {
      workerIdsSet.add(b.worker.workerProfile.id);
    }
  }

  const customerIds = Array.from(customerIdsSet);
  const workerIds = Array.from(workerIdsSet);

  // Map to indices for O(1) lookup
  const customerIndexMap = new Map(customerIds.map((id, index) => [id, index]));
  const workerIndexMap = new Map(workerIds.map((id, index) => [id, index]));

  // Initialize dense matrix and counts for averaging multiple interactions
  const matrix: number[][] = Array(customerIds.length)
    .fill(0)
    .map(() => Array(workerIds.length).fill(0));

  const counts: number[][] = Array(customerIds.length)
    .fill(0)
    .map(() => Array(workerIds.length).fill(0));

  // Fill matrix with matched review ratings
  for (const b of completedBookings) {
    if (!b.worker.workerProfile) continue;

    // Find the review authored by the customer for this specific booking
    const review = reviews.find(
      (r) => r.bookingId === b.id && r.authorId === b.customerId
    );

    const rating = review ? review.rating : 0;
    if (rating === 0) continue; // 0 means no interaction rating, skip adding to average

    const cIdx = customerIndexMap.get(b.customerId);
    const wIdx = workerIndexMap.get(b.worker.workerProfile.id);

    if (cIdx !== undefined && wIdx !== undefined) {
      matrix[cIdx][wIdx] += rating;
      counts[cIdx][wIdx] += 1;
    }
  }

  // Calculate average rating if there are multiple interactions between the same customer and worker
  for (let i = 0; i < customerIds.length; i++) {
    for (let j = 0; j < workerIds.length; j++) {
      if (counts[i][j] > 0) {
        matrix[i][j] /= counts[i][j];
      }
    }
  }

  return { customerIds, workerIds, matrix };
}
