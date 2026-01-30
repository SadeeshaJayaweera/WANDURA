# Wandura - Skilled Labor On-Demand

A full-stack production-ready web application connecting homeowners and contractors with skilled construction workers. Built with Next.js 14, TypeScript, PostgreSQL, and modern web technologies.

## 🚀 Features

### Core Features
- **Multi-role authentication** (Customer, Worker, Hardware Store, Admin)
- **Worker marketplace** with advanced search and filtering
- **Booking system** for hiring workers by day/hour
- **Project management** with task tracking and progress monitoring
- **Material cost estimator** for project planning
- **Hardware store integration** for material ordering
- **Secure payments** via Stripe
- **Rating and review system**
- **Real-time notifications**
- **Wallet system** for workers
- **Google Maps integration** for location-based search

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

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Stripe for payment processing
- Radix UI for accessible components
- TailwindCSS for utility-first styling

## 📞 Support

For support, email support@wandura.com or open an issue in the repository.

---

Built with ❤️ using Next.js 14 and TypeScript
