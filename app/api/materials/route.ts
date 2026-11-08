import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const materials = await prisma.material.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error('Material fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.projectId || !body.name || !body.quantity || !body.unit) {
      return NextResponse.json({ error: 'Missing required fields: projectId, name, quantity, unit' }, { status: 400 })
    }

    const material = await prisma.material.create({
      data: {
        projectId: body.projectId,
        name: body.name,
        quantity: parseFloat(body.quantity),
        unit: body.unit,
        unitPrice: body.unitPrice ? parseFloat(body.unitPrice) : null,
        totalPrice: parseFloat(body.quantity) * (parseFloat(body.unitPrice) || 0),
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const materialId = searchParams.get('id')

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID required' }, { status: 400 })
    }

    await prisma.material.delete({ where: { id: materialId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Material delete error:', error)
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const materialId = searchParams.get('id')
    const body = await req.json()

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID required' }, { status: 400 })
    }

    const allowedFields: Record<string, any> = {}
    if (body.name !== undefined) allowedFields.name = body.name
    if (body.quantity !== undefined) allowedFields.quantity = parseFloat(body.quantity)
    if (body.unit !== undefined) allowedFields.unit = body.unit
    if (body.unitPrice !== undefined) allowedFields.unitPrice = body.unitPrice ? parseFloat(body.unitPrice) : null
    if (body.supplier !== undefined) allowedFields.supplier = body.supplier
    if (body.notes !== undefined) allowedFields.notes = body.notes

    // Recalculate total if quantity or price changed
    if (allowedFields.quantity !== undefined || allowedFields.unitPrice !== undefined) {
      const existing = await prisma.material.findUnique({ where: { id: materialId } })
      const qty = allowedFields.quantity ?? existing?.quantity ?? 0
      const price = allowedFields.unitPrice ?? existing?.unitPrice ?? 0
      allowedFields.totalPrice = qty * price
    }

    const material = await prisma.material.update({
      where: { id: materialId },
      data: allowedFields,
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error('Material update error:', error)
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 })
  }
}
