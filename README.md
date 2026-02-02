# Wandura - Skilled Labor On-Demand

> 🚀 **Enterprise-Level Platform for Construction Industry**

A comprehensive, production-ready full-stack web application connecting homeowners and contractors with skilled construction workers. Built with Next.js 14, TypeScript, PostgreSQL, and cutting-edge web technologies.

**Developed by: Sadeesha Jayaweera** 👨‍💻  
📧 Email: sadeesha.jayaweera@gmail.com  
🔗 LinkedIn: [https://www.linkedin.com/in/sadeesha-jayaweera](https://www.linkedin.com/in/sadeesha-jayaweera)  
🐙 GitHub: [Sadeesha_Jayaweera](https://github.com/Sadeesha_Jayaweera)

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📑 Table of Contents

- [Features](#-features)
- [Application Statistics](#-application-statistics)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Schema](#️-database-schema)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Payment Integration](#-payment-integration)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Key Highlights](#-key-highlights)
- [About the Developer](#-about-the-developer)

## 🚀 Features

### 🎯 Core Features
- **Multi-role authentication** (Customer, Worker, Hardware Store, Admin)
- **Worker marketplace** with advanced search and filtering
- **Booking system** for hiring workers by day/hour
- **Comprehensive project management** with task tracking and progress monitoring
- **Advanced cost estimator** with save and PDF export
- **Hardware store marketplace** with shopping cart
- **Secure payments** via Stripe with commission tracking
- **Rating and review system**
- **Real-time notifications**
- **Wallet system** for workers
- **Google Maps integration** for location-based search

### ✨ Advanced Features (NEW!)
- **📊 Analytics Dashboard** - Detailed insights for all user roles with charts and metrics
- **🛒 E-commerce Integration** - Full shopping cart system for hardware materials
- **📅 Booking Management** - Complete workflow from request to completion
- **🏗️ Project Management** - Task lists, material tracking, and progress visualization
- **👨‍💼 Admin Panel** - Comprehensive platform management and monitoring
- **💬 Chat System** - Built-in messaging (API ready for real-time)
- **💰 Enhanced Estimator** - Save estimates, export to PDF, and share
- **📈 Business Intelligence** - Time-based analytics with visual reports
- **🔔 Advanced Notifications** - Multi-channel notification system
- **📦 Inventory Management** - Stock tracking and order processing

### User Roles

#### Customer
- Search and book skilled workers
- Create and manage projects
- Track project progress
- Estimate material costs
- Order materials from hardware stores
- Rate and review workers

#### Worker
- Create professional profile with portfolio
- Set daily/hourly rates
- Accept/reject booking requests
- Track earnings and jobs
- Manage availability
- Receive and withdraw payments

#### Hardware Store
- Manage product inventory
- Accept and process orders
- Track deliveries
- Manage pricing and stock

#### Admin
- Platform oversight
- User management
- Analytics dashboard

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js (JWT)
- **Payments:** Stripe
- **Maps:** Google Maps API
- **UI Components:** Radix UI
- **Form Validation:** Zod
- **Icons:** Lucide React

## 📁 Project Structure

```
WANDURA/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── workers/
│   │   ├── bookings/
│   │   ├── projects/
│   │   └── ...
│   ├── auth/
│   │   ├── signin/
│   │   └── signup/
│   ├── dashboard/
│   ├── workers/
│   ├── estimator/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Stripe account (for payments)
- Google Maps API key (for location features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd WANDURA
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wandura?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PLATFORM_COMMISSION_RATE="0.10"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with sample data
npm run prisma:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - Authentication and basic user data
- **Profile** - Customer profile information
- **WorkerProfile** - Worker-specific data (skills, rates, portfolio)
- **StoreProfile** - Hardware store information
- **Booking** - Worker booking/hiring records
- **Project** - Customer project management
- **Task** - Project tasks
- **Material** - Project materials
- **Estimate** - Cost estimates
- **Product** - Hardware store products
- **Order** - Material orders
- **Review** - Ratings and reviews
- **Transaction** - Payment records
- **Notification** - User notifications

## 👥 Sample Login Credentials

After running the seed script, you can use these credentials:

- **Admin:** admin@wandura.com / password123
- **Customer:** john.doe@example.com / password123
- **Worker:** mike.mason@example.com / password123
- **Hardware Store:** contact@buildersmart.com / password123

## 🎨 UI Components

The application uses a custom component library built on Radix UI:

- Button
- Input
- Textarea
- Select
- Card
- Label
- Toast/Notifications
- And more...

All components support dark mode and are fully accessible.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control (RBAC)
- Secure payment processing via Stripe
- SQL injection prevention via Prisma

## 💳 Payment Integration

The platform integrates Stripe for secure payments:

- Worker booking payments
- 10% platform commission
- Worker wallet system
- Withdrawal management
- Payment history tracking

## 📱 Responsive Design

Fully responsive design that works on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:seed       # Seed database with sample data
npm run prisma:studio     # Open Prisma Studio
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment, especially:
- DATABASE_URL (production database)
- NEXTAUTH_SECRET (strong random string)
- Stripe production keys
- Google Maps API key with proper restrictions

### Recommended Platforms

- **Vercel** (recommended for Next.js)
- **Railway** (for PostgreSQL)
- **AWS**
- **DigitalOcean**

## 📚 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Workers
- `GET /api/workers` - Get all workers (with filters)
- `GET /api/workers/[id]` - Get worker by ID
- `POST /api/workers` - Create worker profile
- `PATCH /api/workers/[id]` - Update worker profile

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/[id]` - Update booking status

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/[id]` - Update project

### Products & Stores ✨ NEW
- `GET /api/products` - Get products (with category filters)
- `POST /api/products` - Create new product (store only)

### Reviews
- `POST /api/reviews` - Submit review and rating

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark notifications as read

### Analytics ✨ NEW
- `GET /api/analytics` - Get analytics data (role-specific, time-based)

### Chat ✨ NEW
- `GET /api/chat` - Get messages for a booking
- `POST /api/chat` - Send a message

### Availability ✨ NEW
- `GET /api/availability` - Get worker availability
- `PATCH /api/availability` - Update worker schedule

### Tasks ✨ NEW
- `POST /api/tasks` - Create project task
- `PATCH /api/tasks` - Update task status

### Materials ✨ NEW
- `POST /api/materials` - Add material to project

### Estimates ✨ NEW
- `GET /api/estimates` - Get saved estimates
- `POST /api/estimates` - Save new estimate

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Key Highlights

### What Makes Wandura Special

✅ **Comprehensive** - Complete ecosystem for construction labor marketplace  
✅ **Scalable** - Enterprise-level architecture built for growth  
✅ **Modern** - Latest Next.js 14 with App Router and Server Components  
✅ **Type-Safe** - 100% TypeScript with strict mode  
✅ **Secure** - Industry-standard security practices  
✅ **Fast** - Optimized performance and loading times  
✅ **Beautiful** - Modern UI with TailwindCSS and Radix UI  
✅ **Complete** - From authentication to payments, everything included  

### Recent Major Updates

**January 2026** - Massive Feature Enhancement 🚀
- Added advanced analytics dashboard with charts
- Implemented comprehensive booking management system
- Built full project management with tasks and materials
- Created hardware store marketplace with shopping cart
- Developed admin panel for platform management
- Enhanced cost estimator with save and PDF export
- Added chat system API (real-time ready)
- Implemented worker availability management
- Added 8+ new API endpoints
- Created 6+ new pages and features

## 🙏 Acknowledgments

**Developer:** Sadeesha Jay - Full-stack development and architecture

**Technologies:**
- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Stripe for payment processing
- Radix UI for accessible components
- TailwindCSS for utility-first styling
- Vercel for hosting platform

## 📞 Support

For support, email support@wandura.com or open an issue in the repository.

## 👨‍💻 About the Developer

**Sadeesha Jay** - Passionate full-stack developer specializing in modern web technologies. Built Wandura as a comprehensive platform to revolutionize the construction labor marketplace.

**Key Achievements:**
- 🏆 Built complete enterprise-level platform from scratch
- 💼 Implemented 30+ major features
- 📊 Created 20+ RESTful API endpoints  
- 🎨 Designed modern, responsive UI/UX
- 🔒 Ensured industry-standard security
- 📱 Optimized for all devices
- ⚡ Delivered production-ready code

Connect:
- 💼 LinkedIn: [linkedin.com/in/sadeesha-jayaweera](https://www.linkedin.com/in/sadeesha-jayaweera)
- 🐙 GitHub: [github.com/Sadeesha_Jayaweera](https://github.com/Sadeesha_Jayaweera)
- 📧 Email: sadeesha.jayaweera@gmail.com

---

**Built with ❤️ by Sadeesha Jay**

*Using Next.js 14, TypeScript, PostgreSQL, Prisma, and modern web technologies*

© 2026 Wandura. All rights reserved.
