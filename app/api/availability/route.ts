import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'WORKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!workerProfile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 })
    }

    // Get availability from worker profile (you can extend schema later)
    // For now, return sample availability
    const availability = {
      monday: { available: true, hours: '9:00 AM - 5:00 PM' },
      tuesday: { available: true, hours: '9:00 AM - 5:00 PM' },
      wednesday: { available: true, hours: '9:00 AM - 5:00 PM' },
      thursday: { available: true, hours: '9:00 AM - 5:00 PM' },
      friday: { available: true, hours: '9:00 AM - 5:00 PM' },
      saturday: { available: false, hours: '' },
      sunday: { available: false, hours: '' },
    }

    return NextResponse.json({
      isAvailable: workerProfile.isAvailable,
      schedule: availability,
    })
  } catch (error) {
    console.error('Availability fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'WORKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { isAvailable } = body

    await prisma.workerProfile.update({
      where: { userId: session.user.id },
      data: { isAvailable },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Availability update error:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}
