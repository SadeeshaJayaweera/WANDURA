import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      include: {
        workerProfile: true,
        storeProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, workerVerified, storeVerified, emailVerified, role } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Update user fields
    const userUpdateData: any = {}
    if (typeof emailVerified === 'boolean') {
      userUpdateData.emailVerified = emailVerified
    }
    if (role) {
      userUpdateData.role = role
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      })
    }

    // Update worker verification
    if (typeof workerVerified === 'boolean') {
      await prisma.workerProfile.updateMany({
        where: { userId },
        data: { isVerified: workerVerified },
      })
    }

    // Update store verification
    if (typeof storeVerified === 'boolean') {
      await prisma.storeProfile.updateMany({
        where: { userId },
        data: { isVerified: storeVerified },
      })
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workerProfile: true,
        storeProfile: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
