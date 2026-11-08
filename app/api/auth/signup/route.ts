import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signUpSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = signUpSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user with corresponding role profile
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
        profile: {
          create: {
            city: 'Colombo',
            state: 'Western Province',
            country: 'Sri Lanka',
          },
        },
        ...(validatedData.role === 'HARDWARE_STORE' && {
          storeProfile: {
            create: {
              storeName: validatedData.name,
              description: 'Hardware store supplying construction materials in Sri Lanka.',
              address: 'Main Street',
              city: 'Colombo',
              state: 'Western Province',
              zipCode: '00100',
              phone: '+94 11 200 0000',
              isVerified: true,
            },
          },
        }),
        ...(validatedData.role === 'WORKER' && {
          workerProfile: {
            create: {
              skill: 'MASON',
              dailyRate: 5000,
              experience: 3,
              bio: 'Experienced skilled tradesperson in Sri Lanka.',
              city: 'Colombo',
              state: 'Western Province',
              zipCode: '00100',
              isVerified: true,
              isAvailable: true,
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}
