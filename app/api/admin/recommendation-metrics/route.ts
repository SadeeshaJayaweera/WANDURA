import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { computeExposureFairness } from "@/lib/recommendation/analytics/exposureFairness";

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

    const exposureFairness = await computeExposureFairness(prisma, { from: fromDate, to: toDate });
    const totalRecommendations = await prisma.recommendationLog.count({
      where: { createdAt: { gte: fromDate, lte: toDate } }
    });

    return NextResponse.json({
      totalRecommendations,
      exposureFairness
    });

  } catch (error) {
    console.error("Error fetching recommendation metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
