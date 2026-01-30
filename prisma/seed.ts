import { PrismaClient, Role, SkillType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.estimate.deleteMany()
  await prisma.material.deleteMany()
  await prisma.task.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.project.deleteMany()
  await prisma.workerProfile.deleteMany()
  await prisma.storeProfile.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@wandura.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      emailVerified: true,
      profile: {
        create: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
        },
      },
    },
  })

  // Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: Role.CUSTOMER,
      phone: '+1-555-0101',
      emailVerified: true,
      profile: {
        create: {
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          latitude: 37.7749,
          longitude: -122.4194,
        },
      },
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: Role.CUSTOMER,
      phone: '+1-555-0102',
      emailVerified: true,
      profile: {
        create: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          latitude: 34.0522,
          longitude: -118.2437,
        },
      },
    },
  })

  // Create Workers
  const worker1 = await prisma.user.create({
    data: {
      email: 'mike.mason@example.com',
      password: hashedPassword,
      name: 'Mike Thompson',
      role: Role.WORKER,
      phone: '+1-555-0201',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.MASON,
          dailyRate: 250,
          hourlyRate: 35,
          experience: 8,
          bio: 'Expert mason with 8 years of experience in residential and commercial projects.',
          isVerified: true,
          isAvailable: true,
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          latitude: 37.7749,
          longitude: -122.4194,
          rating: 4.8,
          totalReviews: 45,
          totalJobs: 52,
          totalEarnings: 13000,
          walletBalance: 2500,
        },
      },
    },
  })

  const worker2 = await prisma.user.create({
    data: {
      email: 'sarah.welder@example.com',
      password: hashedPassword,
      name: 'Sarah Johnson',
      role: Role.WORKER,
      phone: '+1-555-0202',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.WELDER,
          dailyRate: 300,
          hourlyRate: 40,
          experience: 6,
          bio: 'Certified welder specializing in structural steel and custom metalwork.',
          isVerified: true,
          isAvailable: true,
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94104',
          latitude: 37.7849,
          longitude: -122.4094,
          rating: 4.9,
          totalReviews: 38,
          totalJobs: 41,
          totalEarnings: 12300,
          walletBalance: 1800,
        },
      },
    },
  })

  const worker3 = await prisma.user.create({
    data: {
      email: 'tom.tiles@example.com',
      password: hashedPassword,
      name: 'Tom Martinez',
      role: Role.WORKER,
      phone: '+1-555-0203',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.TILE_LAYER,
          dailyRate: 220,
          hourlyRate: 30,
          experience: 5,
          bio: 'Professional tile layer with expertise in ceramic, porcelain, and natural stone.',
          isVerified: true,
          isAvailable: true,
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90002',
          latitude: 34.0622,
          longitude: -118.2337,
          rating: 4.7,
          totalReviews: 29,
          totalJobs: 34,
          totalEarnings: 7480,
          walletBalance: 920,
        },
      },
    },
  })

  const worker4 = await prisma.user.create({
    data: {
      email: 'carlos.carpenter@example.com',
      password: hashedPassword,
      name: 'Carlos Rodriguez',
      role: Role.WORKER,
      phone: '+1-555-0204',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.CARPENTER,
          dailyRate: 280,
          hourlyRate: 38,
          experience: 10,
          bio: 'Master carpenter with extensive experience in framing, finish work, and custom furniture.',
          isVerified: true,
          isAvailable: false,
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          latitude: 37.7899,
          longitude: -122.3944,
          rating: 5.0,
          totalReviews: 61,
          totalJobs: 68,
          totalEarnings: 19040,
          walletBalance: 3200,
        },
      },
    },
  })

  // Create Hardware Stores
  const store1 = await prisma.user.create({
    data: {
      email: 'contact@buildersmart.com',
      password: hashedPassword,
      name: 'Builder Smart Store Manager',
      role: Role.HARDWARE_STORE,
      phone: '+1-555-0301',
      emailVerified: true,
      storeProfile: {
        create: {
          storeName: 'Builder Smart Hardware',
          description: 'Your one-stop shop for all construction materials and tools.',
          address: '789 Industrial Blvd',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94110',
          latitude: 37.7499,
          longitude: -122.4144,
          phone: '+1-555-0301',
          isVerified: true,
          rating: 4.6,
          totalReviews: 124,
        },
      },
    },
  })

  const store2 = await prisma.user.create({
    data: {
      email: 'info@protrade.com',
      password: hashedPassword,
      name: 'Pro Trade Supplies Manager',
      role: Role.HARDWARE_STORE,
      phone: '+1-555-0302',
      emailVerified: true,
      storeProfile: {
        create: {
          storeName: 'Pro Trade Supplies',
          description: 'Professional-grade materials for contractors and builders.',
          address: '321 Commerce Dr',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90010',
          latitude: 34.0622,
          longitude: -118.2937,
          phone: '+1-555-0302',
          isVerified: true,
          rating: 4.8,
          totalReviews: 89,
        },
      },
    },
  })

  // Create Products for Store 1
  const storeProfile1 = await prisma.storeProfile.findUnique({
    where: { userId: store1.id },
  })

  if (storeProfile1) {
    await prisma.product.createMany({
      data: [
        {
          storeId: storeProfile1.id,
          name: 'Portland Cement',
          description: 'High-quality Type I Portland Cement, 94 lb bag',
          category: 'Cement & Concrete',
          unit: 'bag',
          price: 12.99,
          stock: 500,
          isAvailable: true,
        },
        {
          storeId: storeProfile1.id,
          name: 'River Sand',
          description: 'Clean washed river sand for construction',
          category: 'Sand & Aggregate',
          unit: 'ton',
          price: 45.00,
          stock: 100,
          isAvailable: true,
        },
        {
          storeId: storeProfile1.id,
          name: 'Ceramic Floor Tiles',
          description: '12x12 inch ceramic tiles, various colors',
          category: 'Tiles',
          unit: 'box',
          price: 28.50,
          stock: 250,
          isAvailable: true,
        },
        {
          storeId: storeProfile1.id,
          name: 'Steel Rebar #4',
          description: '1/2 inch diameter, Grade 60, 20 ft length',
          category: 'Steel & Metal',
          unit: 'piece',
          price: 8.75,
          stock: 800,
          isAvailable: true,
        },
        {
          storeId: storeProfile1.id,
          name: 'Gravel (3/4 inch)',
          description: 'Crushed stone aggregate',
          category: 'Sand & Aggregate',
          unit: 'ton',
          price: 38.00,
          stock: 150,
          isAvailable: true,
        },
      ],
    })
  }

  // Create Products for Store 2
  const storeProfile2 = await prisma.storeProfile.findUnique({
    where: { userId: store2.id },
  })

  if (storeProfile2) {
    await prisma.product.createMany({
      data: [
        {
          storeId: storeProfile2.id,
          name: 'Concrete Blocks',
          description: 'Standard 8x8x16 inch concrete masonry unit',
          category: 'Blocks & Bricks',
          unit: 'piece',
          price: 2.25,
          stock: 1000,
          isAvailable: true,
        },
        {
          storeId: storeProfile2.id,
          name: 'Tile Adhesive',
          description: 'Premium polymer-modified thin-set mortar, 50 lb bag',
          category: 'Adhesives & Mortar',
          unit: 'bag',
          price: 18.99,
          stock: 200,
          isAvailable: true,
        },
        {
          storeId: storeProfile2.id,
          name: 'Welding Electrodes',
          description: 'E7018 welding rods, 1/8 inch diameter',
          category: 'Welding Supplies',
          unit: 'lb',
          price: 15.50,
          stock: 75,
          isAvailable: true,
        },
        {
          storeId: storeProfile2.id,
          name: 'Lumber 2x4x8',
          description: 'Premium kiln-dried construction lumber',
          category: 'Lumber',
          unit: 'piece',
          price: 6.85,
          stock: 600,
          isAvailable: true,
        },
      ],
    })
  }

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      customerId: customer1.id,
      name: 'Kitchen Renovation',
      description: 'Complete kitchen remodel with new tiles and cabinets',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-03-15'),
      budget: 15000,
      status: 'ACTIVE',
      progress: 35,
    },
  })

  const project2 = await prisma.project.create({
    data: {
      customerId: customer2.id,
      name: 'Backyard Patio Construction',
      description: 'Build new concrete patio with decorative stone work',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      startDate: new Date('2026-02-10'),
      endDate: new Date('2026-03-20'),
      budget: 8500,
      status: 'ACTIVE',
      progress: 20,
    },
  })

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: project1.id,
        title: 'Remove old tiles',
        status: 'COMPLETED',
        priority: 'HIGH',
      },
      {
        projectId: project1.id,
        title: 'Install new floor tiles',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
      {
        projectId: project1.id,
        title: 'Paint walls',
        status: 'TODO',
        priority: 'MEDIUM',
      },
      {
        projectId: project2.id,
        title: 'Excavate patio area',
        status: 'COMPLETED',
        priority: 'HIGH',
      },
      {
        projectId: project2.id,
        title: 'Pour concrete foundation',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
    ],
  })

  // Create Materials
  await prisma.material.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'Ceramic Floor Tiles',
        quantity: 15,
        unit: 'box',
        unitPrice: 28.50,
        totalPrice: 427.50,
      },
      {
        projectId: project1.id,
        name: 'Tile Adhesive',
        quantity: 8,
        unit: 'bag',
        unitPrice: 18.99,
        totalPrice: 151.92,
      },
      {
        projectId: project2.id,
        name: 'Portland Cement',
        quantity: 40,
        unit: 'bag',
        unitPrice: 12.99,
        totalPrice: 519.60,
      },
      {
        projectId: project2.id,
        name: 'River Sand',
        quantity: 2,
        unit: 'ton',
        unitPrice: 45.00,
        totalPrice: 90.00,
      },
    ],
  })

  // Create Bookings
  await prisma.booking.createMany({
    data: [
      {
        customerId: customer1.id,
        workerId: worker3.id,
        projectId: project1.id,
        status: 'IN_PROGRESS',
        skill: SkillType.TILE_LAYER,
        startDate: new Date('2026-02-05'),
        endDate: new Date('2026-02-10'),
        totalDays: 5,
        ratePerDay: 220,
        totalAmount: 1100,
        commission: 110,
        paymentStatus: 'COMPLETED',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      },
      {
        customerId: customer2.id,
        workerId: worker1.id,
        projectId: project2.id,
        status: 'ACCEPTED',
        skill: SkillType.MASON,
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-20'),
        totalDays: 5,
        ratePerDay: 250,
        totalAmount: 1250,
        commission: 125,
        paymentStatus: 'COMPLETED',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
      },
    ],
  })

  // Create Reviews
  await prisma.review.createMany({
    data: [
      {
        authorId: customer1.id,
        recipientId: worker3.id,
        rating: 5,
        comment: 'Tom did an excellent job with the tile work. Very professional and detail-oriented!',
      },
      {
        authorId: customer2.id,
        recipientId: worker1.id,
        rating: 5,
        comment: 'Mike is a true professional. The patio looks amazing!',
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Created:')
  console.log('- 1 Admin')
  console.log('- 2 Customers')
  console.log('- 4 Workers')
  console.log('- 2 Hardware Stores')
  console.log('- 9 Products')
  console.log('- 2 Projects')
  console.log('- 5 Tasks')
  console.log('- 4 Materials')
  console.log('- 2 Bookings')
  console.log('- 2 Reviews')
  console.log('\n🔑 Login credentials:')
  console.log('Admin: admin@wandura.com / password123')
  console.log('Customer: john.doe@example.com / password123')
  console.log('Worker: mike.mason@example.com / password123')
  console.log('Store: contact@buildersmart.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
