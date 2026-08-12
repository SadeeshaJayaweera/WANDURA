import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rankPool } from '@/lib/recommendation/hybrid/rankPool'
import { HybridRequest } from '@/lib/recommendation/hybrid/hybridScore'
import { SkillType } from '@prisma/client'

import { SkillType } from '@prisma/client'

/**
 * GET /api/workers
 * 
 * Fetches a list of worker profiles. Supports standard filtering/sorting, or
 * delegates to the ML recommendation engine if `sort=recommended` is provided.
 * 
 * @param req HTTP GET request with query parameters
 * @returns JSON response array of worker profiles
 * 
 * @query
 * - `skill`: `string` (optional, exact match)
 * - `city`: `string` (optional, exact match)
 * - `minRate`: `number` (optional, inclusive)
 * - `maxRate`: `number` (optional, inclusive)
 * - `minRating`: `number` (optional, inclusive)
 * - `isAvailable`: `boolean` (optional, 'true' or 'false')
 * - `sort`: `string` (optional, if 'recommended', delegates to ML ranker)
 * - `lat`: `number` (required if sort=recommended)
 * - `lng`: `number` (required if sort=recommended)
 * - `budget`: `number` (required if sort=recommended)
 * - `topK`: `number` (optional, default 5, used if sort=recommended)
 * 
 * @throws 500 `INTERNAL_SERVER_ERROR` if unexpected failures occur
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const skill = searchParams.get('skill')
    const city = searchParams.get('city')
    const minRate = searchParams.get('minRate')
    const maxRate = searchParams.get('maxRate')
    const minRating = searchParams.get('minRating')
    const isAvailable = searchParams.get('isAvailable')
    
    const sort = searchParams.get('sort')
    const latStr = searchParams.get('lat')
    const lngStr = searchParams.get('lng')
    const budgetStr = searchParams.get('budget')

    if (sort === 'recommended' && skill && latStr && lngStr && budgetStr) {
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      const budget = parseFloat(budgetStr)
      const topK = parseInt(searchParams.get('topK') || '5', 10)

      if (!isNaN(lat) && !isNaN(lng) && !isNaN(budget)) {
        const session = await getServerSession(authOptions)
        const customerId = session?.user?.id || "anonymous"

        const hybridReq: HybridRequest = {
          skill: skill as SkillType,
          lat,
          lng,
          budget,
          customerId,
        }

        // We pass 'prisma as any' if there are slight Prisma version mismatches between libs, 
        // but it should be identical.
        const response = await rankPool(prisma as any, hybridReq, topK)
        
        // Extract results array to maintain backward compatibility with existing GET array response
        return NextResponse.json(response.results)
      }
    }

    const where: any = {}

    if (skill) where.skill = skill
    if (city) where.city = city
    if (isAvailable === 'true') where.isAvailable = true
    if (minRate || maxRate) {
      where.dailyRate = {}
      if (minRate) where.dailyRate.gte = parseFloat(minRate)
      if (maxRate) where.dailyRate.lte = parseFloat(maxRate)
    }
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) }
    }

    const workers = await prisma.workerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    })

    return NextResponse.json(workers)
  } catch (error) {
    console.error('Workers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workers
 * 
 * Creates a new worker profile for the currently authenticated user.
 * 
 * @param req HTTP POST request with JSON body
 * @returns JSON response containing the created worker profile
 * 
 * @body
 * - `skill`: `SkillType`
 * - `dailyRate`: `number`
 * - `hourlyRate`: `number` (optional)
 * - `experience`: `number`
 * - `bio`: `string` (optional)
 * - `address`: `string` (optional)
 * - `city`: `string` (optional)
 * - `state`: `string` (optional)
 * - `zipCode`: `string` (optional)
 * 
 * @throws 401 `UNAUTHORIZED` if the user is not authenticated
 * @throws 500 `INTERNAL_SERVER_ERROR` if creation fails
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const profile = await prisma.workerProfile.create({
      data: {
        userId: session.user.id,
        skill: body.skill,
        dailyRate: body.dailyRate,
        hourlyRate: body.hourlyRate,
        experience: body.experience,
        bio: body.bio,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Worker profile create error:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}
