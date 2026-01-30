import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const material = await prisma.material.create({
      data: {
        projectId: body.projectId,
        name: body.name,
        quantity: body.quantity,
        unit: body.unit,
        unitPrice: body.unitPrice,
        totalPrice: body.quantity * (body.unitPrice || 0),
        supplier: body.supplier,
        notes: body.notes,
      },
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Material create error:', error)
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 })
  }
}
