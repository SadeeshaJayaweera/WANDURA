import { PrismaClient, Role, SkillType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const TAG_VOCABULARY = [
  'waterproofing', 'interior_finishing', 'structural', 'wiring', 'pipefitting', 
  'welding_metalwork', 'tiling', 'painting_decor', 'carpentry_joinery', 
  'renovation', 'new_construction', 'outdoor', 'safety_certified', 'heavy_equipment'
]

async function main() {
  console.log('🌱 Starting Sri Lanka localized seed...')

  // Clear existing data
  await prisma.recommendationLog.deleteMany()
  await prisma.recommendationModelCache.deleteMany()
  await prisma.recommendationWeightConfig.deleteMany()
  await prisma.workerSkillTag.deleteMany()
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

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@wandura.com',
      password: hashedPassword,
      name: 'Wandura Admin (ශ්‍රී ලංකා)',
      role: Role.ADMIN,
      phone: '+94 77 123 4567',
      emailVerified: true,
      profile: {
        create: {
          city: 'Colombo',
          state: 'Western Province',
          country: 'Sri Lanka',
          latitude: 6.9271,
          longitude: 79.8612,
        },
      },
    },
  })

  // 2. Create Sri Lankan Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'kasun.perera@example.com',
      password: hashedPassword,
      name: 'Kasun Perera (කසුන් පෙරේරා)',
      role: Role.CUSTOMER,
      phone: '+94 71 234 5678',
      emailVerified: true,
      profile: {
        create: {
          address: 'No. 45, High Level Road',
          city: 'Maharagama',
          state: 'Western Province',
          zipCode: '10280',
          latitude: 6.8480,
          longitude: 79.9265,
        },
      },
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      email: 'dilini.jayawardena@example.com',
      password: hashedPassword,
      name: 'Dilini Jayawardena (දිලිනි ජයවර්ධන)',
      role: Role.CUSTOMER,
      phone: '+94 76 345 6789',
      emailVerified: true,
      profile: {
        create: {
          address: 'No. 12, Peradeniya Road',
          city: 'Kandy',
          state: 'Central Province',
          zipCode: '20000',
          latitude: 7.2906,
          longitude: 80.6337,
        },
      },
    },
  })

  // 3. Create Sri Lankan Skilled Workers with Sinhala Names & Real Coordinates
  const worker1 = await prisma.user.create({
    data: {
      email: 'sunimal.mason@example.com',
      password: hashedPassword,
      name: 'Sunimal Wickramasinghe (සුනිමල් වික්‍රමසිංහ)',
      role: Role.WORKER,
      phone: '+94 77 987 6543',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.MASON,
          dailyRate: 5500, // LKR
          hourlyRate: 700,
          experience: 12,
          bio: 'වසර 12 ක පළපුරුද්දක් සහිත ප්‍රවීණ මේසන් බාස්. නිවාස ඉදිකිරීම්, කොන්ක්‍රීට් සහ ප්ලාස්ටර් වැඩ සඳහා විශ්වාසනීය සේවය.',
          portfolioImages: [
            'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
          ],
          isVerified: true,
          isAvailable: true,
          city: 'Colombo',
          state: 'Western Province',
          zipCode: '00500',
          latitude: 6.9271,
          longitude: 79.8612,
          rating: 4.9,
          totalReviews: 54,
          totalJobs: 62,
          totalEarnings: 341000,
          walletBalance: 42000,
        },
      },
    },
  })

  const worker2 = await prisma.user.create({
    data: {
      email: 'kasun.welder@example.com',
      password: hashedPassword,
      name: 'Kasun Sampath Fernando (කසුන් සම්පත්)',
      role: Role.WORKER,
      phone: '+94 72 876 5432',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.WELDER,
          dailyRate: 6500, // LKR
          hourlyRate: 850,
          experience: 8,
          bio: 'ග්‍රිල්, ගේට්ටු, යකඩ වහල පලංචි සහ රූෆින් ට්‍රස් සවි කිරීම පිළිබඳ විශේෂඥ වෙල්ඩින් කාර්මික.',
          portfolioImages: [
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          ],
          isVerified: true,
          isAvailable: true,
          city: 'Negombo',
          state: 'Western Province',
          zipCode: '11500',
          latitude: 7.2088,
          longitude: 79.8358,
          rating: 4.8,
          totalReviews: 41,
          totalJobs: 47,
          totalEarnings: 305500,
          walletBalance: 35000,
        },
      },
    },
  })

  const worker3 = await prisma.user.create({
    data: {
      email: 'priyantha.tiles@example.com',
      password: hashedPassword,
      name: 'Priyantha Kumara (ප්‍රියන්ත කුමාර)',
      role: Role.WORKER,
      phone: '+94 78 765 4321',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.TILE_LAYER,
          dailyRate: 5800, // LKR
          hourlyRate: 750,
          experience: 9,
          bio: 'Rocell, Tiara ටයිල් ඇල්ලීම, නාන කාමර සහ පැන්ට්‍රි ටයිල් වැඩ නිවැරදි නිමාවකින් ඉටු කරනු ලැබේ.',
          portfolioImages: [
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
          ],
          isVerified: true,
          isAvailable: true,
          city: 'Maharagama',
          state: 'Western Province',
          zipCode: '10280',
          latitude: 6.8480,
          longitude: 79.9265,
          rating: 4.9,
          totalReviews: 48,
          totalJobs: 53,
          totalEarnings: 307400,
          walletBalance: 28000,
        },
      },
    },
  })

  const worker4 = await prisma.user.create({
    data: {
      email: 'bandara.carpenter@example.com',
      password: hashedPassword,
      name: 'Bandara Jayasinghe (බණ්ඩාර ජයසිංහ)',
      role: Role.WORKER,
      phone: '+94 75 654 3210',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.CARPENTER,
          dailyRate: 5200, // LKR
          hourlyRate: 650,
          experience: 15,
          bio: 'වහල ගැසීම, දොර ජනෙල් උළුවහු සවිකිරීම සහ සියලුම වඩු කාර්මික කටයුතු පිළිබඳ පළපුරුදු වඩු බාස්.',
          portfolioImages: [
            'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
          ],
          isVerified: true,
          isAvailable: true,
          city: 'Kandy',
          state: 'Central Province',
          zipCode: '20000',
          latitude: 7.2906,
          longitude: 80.6337,
          rating: 4.8,
          totalReviews: 67,
          totalJobs: 74,
          totalEarnings: 384800,
          walletBalance: 45000,
        },
      },
    },
  })

  const worker5 = await prisma.user.create({
    data: {
      email: 'nuwan.electric@example.com',
      password: hashedPassword,
      name: 'Nuwan Jayalath (නුවන් ජයලත්)',
      role: Role.WORKER,
      phone: '+94 77 543 2109',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.ELECTRICIAN,
          dailyRate: 6000, // LKR
          hourlyRate: 800,
          experience: 7,
          bio: 'නිවාස හා කාර්යාල වයරිං, ත්‍රි-ෆේස් ලයින්, සෝලාර් සහ ට්‍රිප් ස්විච් ගැටළු විසඳන සහතිකලත් විදුලි කාර්මික.',
          portfolioImages: [
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
          ],
          isVerified: true,
          isAvailable: true,
          city: 'Galle',
          state: 'Southern Province',
          zipCode: '80000',
          latitude: 6.0535,
          longitude: 80.2210,
          rating: 5.0,
          totalReviews: 32,
          totalJobs: 36,
          totalEarnings: 216000,
          walletBalance: 30000,
        },
      },
    },
  })

  const worker6 = await prisma.user.create({
    data: {
      email: 'nimal.plumber@example.com',
      password: hashedPassword,
      name: 'Nimal Siriwardena (නිමල් සිරිවර්ධන)',
      role: Role.WORKER,
      phone: '+94 71 432 1098',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      workerProfile: {
        create: {
          skill: SkillType.PLUMBER,
          dailyRate: 4800, // LKR
          hourlyRate: 600,
          experience: 11,
          bio: 'ජල නල එළීම, බට පිපිරීම් අලුත්වැඩියාව, කොමඩ් හා සින්ක් සවිකිරීම් සහ වෝටර් මෝටර් සවි කිරීමේ ප්‍රවීණ නල කාර්මික.',
          portfolioImages: [
            'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
          ],
          isVerified: true,
          isAvailable: true,
          city: 'Gampaha',
          state: 'Western Province',
          zipCode: '11000',
          latitude: 7.0840,
          longitude: 79.9943,
          rating: 4.7,
          totalReviews: 39,
          totalJobs: 44,
          totalEarnings: 211200,
          walletBalance: 24000,
        },
      },
    },
  })

  // 4. Create WorkerSkillTags
  const wp1 = await prisma.workerProfile.findUnique({ where: { userId: worker1.id } })
  if (wp1) {
    await prisma.workerSkillTag.createMany({
      data: [
        { workerProfileId: wp1.id, tag: 'structural', weight: 0.95 },
        { workerProfileId: wp1.id, tag: 'new_construction', weight: 0.90 },
        { workerProfileId: wp1.id, tag: 'renovation', weight: 0.85 },
      ]
    })
  }

  const wp2 = await prisma.workerProfile.findUnique({ where: { userId: worker2.id } })
  if (wp2) {
    await prisma.workerSkillTag.createMany({
      data: [
        { workerProfileId: wp2.id, tag: 'welding_metalwork', weight: 0.98 },
        { workerProfileId: wp2.id, tag: 'structural', weight: 0.92 },
        { workerProfileId: wp2.id, tag: 'safety_certified', weight: 0.88 },
      ]
    })
  }

  const wp3 = await prisma.workerProfile.findUnique({ where: { userId: worker3.id } })
  if (wp3) {
    await prisma.workerSkillTag.createMany({
      data: [
        { workerProfileId: wp3.id, tag: 'tiling', weight: 0.97 },
        { workerProfileId: wp3.id, tag: 'interior_finishing', weight: 0.92 },
        { workerProfileId: wp3.id, tag: 'waterproofing', weight: 0.85 },
      ]
    })
  }

  const wp4 = await prisma.workerProfile.findUnique({ where: { userId: worker4.id } })
  if (wp4) {
    await prisma.workerSkillTag.createMany({
      data: [
        { workerProfileId: wp4.id, tag: 'carpentry_joinery', weight: 0.99 },
        { workerProfileId: wp4.id, tag: 'interior_finishing', weight: 0.88 },
        { workerProfileId: wp4.id, tag: 'outdoor', weight: 0.80 },
      ]
    })
  }

  // 5. Create Recommendation Weight Configs
  await prisma.recommendationWeightConfig.createMany({
    data: [
      {
        variant: 'WARM',
        proximityWeight: 0.25,
        priceWeight: 0.15,
        ratingWeight: 0.30,
        tagWeight: 0.15,
        collabWeight: 0.15,
        isActive: true,
        createdBy: 'seed:sri-lanka-market'
      },
      {
        variant: 'COLD',
        proximityWeight: 0.35,
        priceWeight: 0.20,
        ratingWeight: 0.30,
        tagWeight: 0.15,
        collabWeight: 0.0,
        isActive: true,
        createdBy: 'seed:sri-lanka-market'
      }
    ]
  })

  // 6. Create Sri Lankan Hardware Stores
  const store1 = await prisma.user.create({
    data: {
      email: 'rathnayake.hardware@example.com',
      password: hashedPassword,
      name: 'Rathnayake Hardware (රත්නායක හාඩ්වෙයාර්)',
      role: Role.HARDWARE_STORE,
      phone: '+94 11 285 4321',
      image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&auto=format&fit=crop&q=80',
      emailVerified: true,
      storeProfile: {
        create: {
          storeName: 'Rathnayake Hardware & Building Supplies',
          description: 'සිමෙන්ති, වැලි, ගල්, ගඩොල්, යකඩ කම්බි සහ සියලුම ගොඩනැගිලි ද්‍රව්‍ය තොග හා සිල්ලරට.',
          address: 'No. 220, High Level Road',
          city: 'Maharagama',
          state: 'Western Province',
          zipCode: '10280',
          latitude: 6.8480,
          longitude: 79.9265,
          phone: '+94 11 285 4321',
          isVerified: true,
          rating: 4.8,
          totalReviews: 142,
        },
      },
    },
  })

  const store2 = await prisma.user.create({
    data: {
      email: 'lanka.buildmart@example.com',
      password: hashedPassword,
      name: 'Lanka BuildMart Kandy (ලංකා බිල්ඩ්මාර්ට්)',
      role: Role.HARDWARE_STORE,
      phone: '+94 81 223 3445',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      emailVerified: true,
      storeProfile: {
        create: {
          storeName: 'Lanka BuildMart & Timber Stores',
          description: 'මහනුවර සහ ඒ අවට ප්‍රදේශ සඳහා විශ්වාසනීය දැව, ටයිල් සහ සියලුම හාඩ්වෙයාර් සැපයුම්.',
          address: 'No. 85, Katugastota Road',
          city: 'Kandy',
          state: 'Central Province',
          zipCode: '20000',
          latitude: 7.2906,
          longitude: 80.6337,
          phone: '+94 81 223 3445',
          isVerified: true,
          rating: 4.7,
          totalReviews: 98,
        },
      },
    },
  })

  // 7. Create Products with Sri Lankan LKR Pricing and Real Material Categories
  const sp1 = await prisma.storeProfile.findUnique({ where: { userId: store1.id } })
  const sp2 = await prisma.storeProfile.findUnique({ where: { userId: store2.id } })

  if (sp1) {
    await prisma.product.createMany({
      data: [
        {
          storeId: sp1.id,
          name: 'Tokyo Super Portland Cement (ටෝකියෝ සිමෙන්ති 50kg)',
          description: 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම SLS සහතිකලත් කොන්ක්‍රීට් සිමෙන්ති කොට්ටය (50kg bag).',
          category: 'Cement & Concrete',
          unit: 'bag',
          price: 2450, // LKR
          stock: 450,
          images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp1.id,
          name: 'Clean River Sand (නදී වැලි - කියුබ් 1)',
          description: 'ප්ලාස්ටර් සහ කොන්ක්‍රීට් සඳහා පිරිසිදු ගංගා වැලි 1 Cube (කියුබ් 1 ටිපර් රථයකින් ලබාදීම).',
          category: 'Sand & Aggregate',
          unit: 'cube',
          price: 22000, // LKR
          stock: 40,
          images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp1.id,
          name: '3/4 inch Blue Metal (කළුගල් 3/4 - කියුබ් 1)',
          description: 'ශක්තිමත් කොන්ක්‍රීට් මිශ්‍රණ සඳහා උසස් තත්වයේ තලාපු කළුගල් (Aggregate).',
          category: 'Sand & Aggregate',
          unit: 'cube',
          price: 16500, // LKR
          stock: 35,
          images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp1.id,
          name: 'Traditional Wire-Cut Clay Bricks (රතු ගඩොල්)',
          description: 'උසස් තත්ත්වයේ මැටි ගඩොල් (Wire-cut Red Clay Bricks). බිත්ති බැඳීමට සුදුසුයි.',
          category: 'Blocks & Bricks',
          unit: 'piece',
          price: 34, // LKR
          stock: 15000,
          images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp1.id,
          name: 'Lanwa Sanstha Steel Rebar 10mm (ලංවා යකඩ කම්බි)',
          description: 'SLS 375 ප්‍රමිතියෙන් යුත් කොන්ක්‍රීට් යකඩ කම්බි (අඩි 20 දිග තනි කම්බිය).',
          category: 'Steel & Metal',
          unit: 'piece',
          price: 1850, // LKR
          stock: 600,
          images: ['https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp1.id,
          name: 'S-Lon PVC Pressure Pipe 1-inch (පීවීසී බටය)',
          description: 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම SLS සහතිකලත් පානීය ජල නල පද්ධති සඳහා PVC බට (අඩි 13).',
          category: 'Plumbing & Pipes',
          unit: 'piece',
          price: 920, // LKR
          stock: 180,
          images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
      ],
    })
  }

  if (sp2) {
    await prisma.product.createMany({
      data: [
        {
          storeId: sp2.id,
          name: 'Holcim Sanstha Cement (හෝල්සිම් සංස්ථා සිමෙන්ති 50kg)',
          description: 'නිවාස ඉදිකිරීම් සඳහා දිවයින පුරා ප්‍රචලිත සංස්ථා සිමෙන්ති (50kg bag).',
          category: 'Cement & Concrete',
          unit: 'bag',
          price: 2500, // LKR
          stock: 350,
          images: ['https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp2.id,
          name: 'Cement Solid Blocks 4x8x16 (සිමෙන්ති බ්ලොක් ගල්)',
          description: 'ශක්තිමත් සිමෙන්ති කොන්ක්‍රීට් බ්ලොක් ගල් (Solid Masonry Blocks).',
          category: 'Blocks & Bricks',
          unit: 'piece',
          price: 95, // LKR
          stock: 2500,
          images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp2.id,
          name: 'Rocell Ceramic Floor Tiles 2x2 ft (රොසෙල් ටයිල් පෙට්ටිය)',
          description: 'ප්‍රමුඛ පෙළේ රොසෙල් සෙරමික් ටයිල් (පෙට්ටියක වර්ග අඩි 16 ක් අඩංගුයි).',
          category: 'Tiles',
          unit: 'box',
          price: 6800, // LKR
          stock: 120,
          images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp2.id,
          name: 'Lanwa Tile Adhesive Mortar (ටයිල් මෝටාර් 25kg)',
          description: 'ටයිල් ශක්තිමත්ව ඇල්ලීමට සකස් කළ පොලිමර් මෝටාර් මිශ්‍රණය.',
          category: 'Adhesives & Mortar',
          unit: 'bag',
          price: 1650, // LKR
          stock: 180,
          images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp2.id,
          name: 'Overcord Welding Electrodes 2.5mm (වෙල්ඩින් කූරු පැකට්ටුව)',
          description: 'යකඩ සහ වානේ වෙල්ඩින් කිරීම සඳහා උසස් තත්ත්වයේ වෙල්ඩින් රොඩ්ස්.',
          category: 'Welding Supplies',
          unit: 'pack',
          price: 3200, // LKR
          stock: 65,
          images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
        {
          storeId: sp2.id,
          name: 'Robbialac Brilliant White Emulsion 10L (සුදු තීන්ත)',
          description: 'ඇතුළත බිත්ති සඳහා ඉහළ නිමාවක් ලබාදෙන රොබියැලැක් ප්‍රමුඛතම වයිට් ඉමල්ෂන්.',
          category: 'Paint & Finishes',
          unit: 'bucket',
          price: 14500, // LKR
          stock: 40,
          images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'],
          isAvailable: true,
        },
      ],
    })
  }

  // 8. Create Sri Lankan Sample Project
  const project1 = await prisma.project.create({
    data: {
      customerId: customer1.id,
      name: 'මහරගම දෙමහල් නිවාස ඉදිකිරීම (Two-Story House Maharagama)',
      description: 'පළමු මහල මේසන් වැඩ, ප්ලාස්ටර් සහ ටයිල් ඇල්ලීම සඳහා කොන්ත්‍රාත්තුව.',
      address: 'No. 88, Temple Road',
      city: 'Maharagama',
      state: 'Western Province',
      zipCode: '10280',
      startDate: new Date('2026-11-15'),
      endDate: new Date('2027-02-28'),
      budget: 1850000, // LKR
      status: 'ACTIVE',
      progress: 35,
      tasks: {
        create: [
          { title: 'අත්තිවාරම සහ කොන්ක්‍රීට් කණු දැමීම (Foundation & Columns)', status: 'COMPLETED', priority: 'HIGH' },
          { title: 'පළමු මහලේ ගඩොල් බිත්ති බැඳීම (Brick Masonry Walls)', status: 'IN_PROGRESS', priority: 'HIGH' },
          { title: 'සැඟවුණු විදුලි නල එළීම (Concealed Electrical Piping)', status: 'TODO', priority: 'MEDIUM' },
          { title: 'ප්ලාස්ටර් වැඩ අවසන් කිරීම (Plastering Work)', status: 'TODO', priority: 'MEDIUM' },
        ],
      },
      materials: {
        create: [
          { name: 'Tokyo Super Cement', quantity: 150, unit: 'bag', unitPrice: 2450, totalPrice: 367500 },
          { name: 'Clean River Sand', quantity: 4, unit: 'cube', unitPrice: 22000, totalPrice: 88000 },
          { name: 'Clay Wire-Cut Bricks', quantity: 5000, unit: 'piece', unitPrice: 34, totalPrice: 170000 },
          { name: 'Lanwa Steel Rebar 10mm', quantity: 60, unit: 'piece', unitPrice: 1850, totalPrice: 111000 },
        ],
      },
    },
  })

  // 9. Create Sample Booking in LKR
  await prisma.booking.create({
    data: {
      customerId: customer1.id,
      workerId: worker1.id,
      projectId: project1.id,
      skill: SkillType.MASON,
      status: 'ACCEPTED',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-14'),
      totalDays: 5,
      ratePerDay: 5500,
      totalAmount: 27500, // LKR
      commission: 2750,
      paymentStatus: 'PENDING',
      address: 'No. 88, Temple Road',
      city: 'Maharagama',
      state: 'Western Province',
      zipCode: '10280',
      description: 'නිවසේ ප්‍රධාන බිත්ති 2 ක් ගඩොලින් බැඳීම සහ පලංචි ගැසීම.',
    },
  })

  // 10. Create Sample Review
  await prisma.review.create({
    data: {
      authorId: customer1.id,
      recipientId: worker1.id,
      rating: 5,
      comment: 'සුනිමල් මහතා ඉතාමත් කඩිසර හා නියම ප්‍රමිතියට වැඩ කරන දක්ෂ මේසන් බාස් කෙනෙක්. නිර්දේශ කරමි!',
    },
  })

  console.log('✅ Sri Lanka seed completed successfully!')
  console.log('🇱🇰 Localized with LKR currency, Sinhala worker names, and real Sri Lankan coordinates.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
