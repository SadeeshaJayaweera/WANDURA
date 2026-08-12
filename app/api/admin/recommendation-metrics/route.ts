import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

/**
 * GET /api/admin/recommendation-metrics
 * 
 * Computes recommendation exposure ratios across worker tiers, enabling
 * offline tracking of how the algorithm distributes traffic to cold vs warm workers.
 * Requires ADMIN role.
 * 
 * @param req HTTP GET request
 * @returns JSON containing raw counts and ratios per tier (New, Mid, Established)
 * 
 * @query
 * - `from`: `string` (ISO date string, optional, defaults to 30 days ago)
 * - `to`: `string` (ISO date string, optional, defaults to now)
 * 
 * @throws 400 if date formats are invalid
 * @throws 401 `UNAUTHORIZED` if the user lacks the ADMIN role
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // Default to last 30 days
    const defaultTo = new Date();
    const defaultFrom = new Date(defaultTo.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    
    const fromDate = fromParam ? new Date(fromParam) : defaultFrom;
    const toDate = toParam ? new Date(toParam) : defaultTo;

    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format. Use ISO strings." }, { status: 400 });
    }

    const logs = await prisma.recommendationLog.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        }
      },
      include: {
        worker: {
          select: { totalReviews: true }
        }
      }
    });

    const total = logs.length;
    let newTier = 0; // 0 - 5 reviews
    let midTier = 0; // 6 - 20 reviews
    let estTier = 0; // 21+ reviews

    for (const log of logs) {
      const revs = log.worker?.totalReviews || 0;
      if (revs <= 5) newTier++;
      else if (revs <= 20) midTier++;
      else estTier++;
    }

    const ratios = {
      new: total ? newTier / total : 0,
      mid: total ? midTier / total : 0,
      established: total ? estTier / total : 0,
    };

    return NextResponse.json({
      totalRecommendations: total,
      counts: {
        new: newTier,
        mid: midTier,
        established: estTier,
      },
      ratios
    });

  } catch (error) {
    console.error("Error fetching recommendation metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
