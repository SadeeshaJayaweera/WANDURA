# 🏗️ Wandura - Skilled Labor On-Demand

<div align="center">

![Wandura Logo](https://img.shields.io/badge/Wandura-Skilled%20Labor%20Platform-blue?style=for-the-badge&logo=hammer&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.8-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**A comprehensive, production-ready full-stack web application connecting homeowners and contractors with skilled construction workers.**

*Similar to Uber/Fiverr but specifically designed for the construction industry*

[Features](#-features) • [Demo](#-application-preview) • [Installation](#-installation) • [Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---


## 📸 Application Preview

### 🏠 Landing Page
<p align="center">
  <img src="./docs/screenshots/homepage.svg" alt="Landing Page" width="100%"/>
</p>

*Modern, responsive landing page showcasing platform features and call-to-action*

### 👷 Worker Search & Discovery
<p align="center">
  <img src="./docs/screenshots/workers-search.svg" alt="Worker Search" width="100%"/>
</p>

*Advanced search with skill-based filtering, location, price range, and availability*

### 📊 Customer Dashboard
<p align="center">
  <img src="./docs/screenshots/dashboard-customer.svg" alt="Customer Dashboard" width="100%"/>
</p>

*Comprehensive dashboard with booking management, projects, and quick actions*

### 💼 Worker Dashboard
<p align="center">
  <img src="./docs/screenshots/dashboard-worker.svg" alt="Worker Dashboard" width="100%"/>
</p>

*Earnings tracking, job management, and availability settings*

### 📅 Booking Management
<p align="center">
  <img src="./docs/screenshots/bookings.svg" alt="Bookings Page" width="100%"/>
</p>

*Complete booking lifecycle management with status tracking*

### 💰 Material Cost Estimator
<p align="center">
  <img src="./docs/screenshots/estimator.svg" alt="Estimator" width="100%"/>
</p>

*Smart calculator with common materials library and PDF export*

### 🏪 Hardware Stores
<p align="center">
  <img src="./docs/screenshots/stores.svg" alt="Stores" width="100%"/>
</p>

*Browse and order construction materials from verified hardware stores*

### 📈 Analytics Dashboard
<p align="center">
  <img src="./docs/screenshots/analytics.svg" alt="Analytics" width="100%"/>
</p>

*Detailed insights and performance metrics for all user types*

### 🔧 Admin Panel
<p align="center">
  <img src="./docs/screenshots/admin-panel.svg" alt="Admin Panel" width="100%"/>
</p>

*Complete platform management with user, booking, and transaction oversight*

---

## 💡 Motivation

The construction and skilled labor industry often struggles with fragmentation and inefficiency. It can be incredibly challenging for homeowners or contractors to find reliable, verified professionals, while skilled workers struggle to maintain a consistent stream of fair-paying jobs. Wandura was created to bridge this gap by bringing transparency, trust, and modern technology to the process. By leveraging a state-of-the-art hybrid recommendation system alongside an end-to-end platform for bookings, payments, and material estimates, Wandura aims to modernize and streamline how construction labor is sourced and managed.

## 🎯 Core Concept

Wandura revolutionizes the construction labor marketplace by connecting:

| Stakeholder | Benefits |
|-------------|----------|
| **Homeowners** | Easy access to verified skilled workers with transparent pricing |
| **Contractors** | Quick hiring of specialized labor for projects |
| **Workers** | Steady job opportunities with fair compensation |
| **Hardware Stores** | Direct sales channel to construction professionals |

---

## 🚀 Features

### 🔐 Authentication & Security
- ✅ Multi-role registration (Customer, Worker, Hardware Store, Admin)
- ✅ JWT-based authentication with NextAuth.js
- ✅ Role-based access control (RBAC)
- ✅ Secure password hashing with bcrypt
- ✅ Protected API routes and pages
- ✅ Session management

### 👷 Worker Module
- ✅ Professional profile creation with portfolio
- ✅ Skills: Mason, Welder, Carpenter, Tile Layer, Plumber, Electrician, Steel Fixer, Painter
- ✅ Daily/hourly rate setting
- ✅ Experience and certification showcase
- ✅ Location-based visibility
- ✅ Availability calendar management
- ✅ Rating and review system
- ✅ Earnings dashboard with wallet
- ✅ Job history tracking
- ✅ Accept/Reject booking requests

### 🤖 Hybrid Recommender System
- ✅ Paper-backed hybrid utility function for worker ranking
- ✅ Content-based signals (Tag Similarity via Cosine Distance)
- ✅ Geographic proximity signals (Haversine Distance)
- ✅ Price-fit optimization based on budget gap
- ✅ Z-Score normalization of ranking features
- ✅ Comprehensive Jest test suite for all recommendation utilities

### 🏠 Customer Module
- ✅ Advanced worker search with multiple filters
- ✅ Skill-based filtering
- ✅ Location and price range filters
- ✅ Rating-based sorting
- ✅ Google Maps integration
- ✅ Booking by day/hour
- ✅ Project scheduling
- ✅ Real-time chat with workers
- ✅ Secure Stripe payments
- ✅ Review and rating submission
- ✅ Active project tracking

### 🏗️ Project Management
- ✅ Project creation and organization
- ✅ Worker assignment to projects
- ✅ Task list management
- ✅ Material tracking
- ✅ Budget monitoring
- ✅ Progress visualization
- ✅ Notes and documentation

### 💰 Material Cost Estimator
- ✅ Add unlimited materials
- ✅ Quantity and unit price input
- ✅ Auto-calculation of totals
- ✅ Common materials library
- ✅ Save estimates to account
- ✅ Export to PDF
- ✅ Share estimates

### 🏪 Hardware Store Module
- ✅ Store dashboard
- ✅ Product catalog management
- ✅ Price and stock management
- ✅ Order processing
- ✅ Delivery status tracking
- ✅ Customer ratings

### 💳 Payment System
- ✅ Stripe integration
- ✅ Secure checkout
- ✅ Platform commission (10%)
- ✅ Worker wallet system
- ✅ Withdrawal management
- ✅ Transaction history
- ✅ Payment webhooks

### ⭐ Reviews & Ratings
- ✅ 1-5 star rating system
- ✅ Written reviews
- ✅ Average rating calculation
- ✅ Review moderation

### 🔔 Notifications
- ✅ Booking confirmations
- ✅ Job acceptance/rejection alerts
- ✅ Payment notifications
- ✅ Delivery updates
- ✅ System announcements

### 📊 Analytics Dashboard
- ✅ Role-specific metrics
- ✅ Time-based filtering (7/30/90 days)
- ✅ Earnings reports
- ✅ Booking statistics
- ✅ Performance insights

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.3 |
| **Styling** | TailwindCSS 3.4 |
| **UI Components** | Radix UI + Custom Components |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5.8 |
| **Authentication** | NextAuth.js 4.24 |
| **Payments** | Stripe |
| **Maps** | Google Maps API |
| **State Management** | Zustand |
| **Form Validation** | Zod |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |

---

## 📁 Project Structure

```
WANDURA/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── workers/              # Worker CRUD operations
│   │   ├── bookings/             # Booking management
│   │   ├── projects/             # Project management
│   │   ├── products/             # Product catalog
│   │   ├── estimates/            # Cost estimates
│   │   ├── analytics/            # Analytics data
│   │   ├── chat/                 # Messaging
│   │   ├── notifications/        # Notification system
│   │   ├── payments/             # Stripe integration
│   │   └── webhooks/             # External webhooks
│   ├── admin/                    # Admin panel
│   ├── analytics/                # Analytics dashboard
│   ├── auth/                     # Auth pages (signin/signup)
│   ├── dashboard/                # User dashboards
│   │   ├── bookings/             # Booking management
│   │   └── projects/             # Project management
│   ├── estimator/                # Cost estimator tool
│   ├── stores/                   # Hardware store listing
│   └── workers/                  # Worker search & profiles
├── components/                   # Reusable components
│   └── ui/                       # Base UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── toast.tsx
│       └── ...
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Auth configuration
│   ├── prisma.ts                 # Prisma client
│   ├── stripe.ts                 # Stripe configuration
│   ├── utils.ts                  # Helper functions
│   └── validations.ts            # Zod schemas
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
├── types/                        # TypeScript types
│   ├── index.ts
│   └── next-auth.d.ts
├── docs/                         # Documentation
│   └── screenshots/              # App screenshots
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **PostgreSQL** database
- **Stripe** account (for payments)
- **Google Maps API** key (for location features)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/SadeeshaJayaweera/wandura.git
cd wandura
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
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_SECRET_KEY="sk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PLATFORM_COMMISSION_RATE="0.10"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run prisma:seed
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

### Core Models

| Model | Description |
|-------|-------------|
| **User** | Authentication and basic user data |
| **Profile** | Customer profile information |
| **WorkerProfile** | Worker-specific data (skills, rates, portfolio) |
| **StoreProfile** | Hardware store information |
| **Booking** | Worker booking/hiring records |
| **Project** | Customer project management |
| **Task** | Project tasks |
| **Material** | Project materials |
| **Estimate** | Cost estimates |
| **Product** | Hardware store products |
| **Order** | Material orders |
| **Review** | Ratings and reviews |
| **Transaction** | Payment records |
| **Notification** | User notifications |

### Enums

- **Role**: CUSTOMER, WORKER, HARDWARE_STORE, ADMIN
- **SkillType**: MASON, TILE_LAYER, WELDER, STEEL_FIXER, CARPENTER, PLUMBER, ELECTRICIAN, PAINTER
- **BookingStatus**: PENDING, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED
- **PaymentStatus**: PENDING, COMPLETED, FAILED, REFUNDED

---

## 👥 Sample Login Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wandura.com | password123 |
| Customer | john.doe@example.com | password123 |
| Worker | mike.mason@example.com | password123 |
| Hardware Store | contact@buildersmart.com | password123 |

---

## 📚 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Sign in user |
| POST | `/api/auth/signout` | Sign out user |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workers` | Get all workers (with filters) |
| GET | `/api/workers/[id]` | Get worker by ID |
| POST | `/api/workers` | Create worker profile |
| PATCH | `/api/workers/[id]` | Update worker profile |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user's bookings |
| POST | `/api/bookings` | Create new booking |
| PATCH | `/api/bookings/[id]` | Update booking status |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create new project |
| PATCH | `/api/projects/[id]` | Update project |

### Estimates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/estimates` | Get saved estimates |
| POST | `/api/estimates` | Save new estimate |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get analytics data |

---

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with sample data
npm run prisma:studio    # Open Prisma Studio
```

---

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Recommended Platforms

| Platform | Use Case |
|----------|----------|
| **Vercel** | Frontend hosting (recommended for Next.js) |
| **Railway** | PostgreSQL database |
| **Neon** | Serverless PostgreSQL |
| **AWS** | Full-stack deployment |
| **DigitalOcean** | VPS deployment |

### Environment Variables for Production

Ensure all environment variables are set:
- `DATABASE_URL` - Production database connection string
- `NEXTAUTH_SECRET` - Strong random string (32+ characters)
- `NEXTAUTH_URL` - Production URL
- Stripe production keys
- Google Maps API key with restrictions

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ Secure payment processing via Stripe
- ✅ SQL injection prevention via Prisma
- ✅ XSS protection
- ✅ CSRF protection

---

## 🎯 Key Highlights

| Feature | Description |
|---------|-------------|
| ✅ **Comprehensive** | Complete ecosystem for construction labor marketplace |
| ✅ **Scalable** | Enterprise-level architecture built for growth |
| ✅ **Modern** | Latest Next.js 14 with App Router |
| ✅ **Type-Safe** | 100% TypeScript with strict mode |
| ✅ **Secure** | Industry-standard security practices |
| ✅ **Fast** | Optimized performance and loading |
| ✅ **Beautiful** | Modern UI with TailwindCSS |
| ✅ **Production-Ready** | Deployment-ready codebase |

---

## 📊 Application Statistics

| Metric | Count |
|--------|-------|
| **API Endpoints** | 25+ |
| **Database Models** | 14 |
| **UI Components** | 15+ |
| **Pages** | 12+ |
| **Features** | 50+ |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Stripe](https://stripe.com/) - Payment processing
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Support

For support, open an issue in the repository.

---

<div align="center">

**Built with ❤️ using modern web technologies**

*Next.js 14, TypeScript, PostgreSQL, Prisma, TailwindCSS*

© 2026 Wandura. All rights reserved.

---

[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>
