# Quick Setup Guide for Wandura

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker Desktop installed on your Mac

### Steps

1. **Start PostgreSQL with Docker**
```bash
docker-compose up -d
```

2. **Run database migrations**
```bash
npx prisma migrate dev --name init
```

3. **Seed the database with sample data**
```bash
npm run prisma:seed
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to http://localhost:3000

### Sample Login Credentials
- **Customer:** john.doe@example.com / password123
- **Worker:** mike.mason@example.com / password123
- **Store:** contact@buildersmart.com / password123
- **Admin:** admin@wandura.com / password123

---

## Option 2: Using Local PostgreSQL

### Prerequisites
- PostgreSQL installed on your Mac

### Steps

1. **Start PostgreSQL service**
```bash
brew services start postgresql@16
```

2. **Create the database**
```bash
createdb wandura
```

3. **Run database migrations**
```bash
npx prisma migrate dev --name init
```

4. **Seed the database**
```bash
npm run prisma:seed
```

5. **Start the development server**
```bash
npm run dev
```

---

## Environment Variables

Make sure your `.env` file is properly configured. See `.env.example` for reference.

For Stripe integration, you'll need to:
1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe dashboard
3. Add them to your `.env` file

For Google Maps:
1. Create a project in Google Cloud Console
2. Enable Maps JavaScript API
3. Create an API key
4. Add it to your `.env` file

---

## Troubleshooting

### Database Connection Issues
If you see "Can't reach database server" error:
- Make sure PostgreSQL is running
- Check if port 5432 is available
- Verify DATABASE_URL in .env file

### Prisma Issues
```bash
# Reset Prisma client
npx prisma generate

# Reset database (⚠️ This will delete all data)
npx prisma migrate reset
```

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

---

## Next Steps

1. Explore the application features
2. Customize the landing page
3. Set up Stripe test payments
4. Configure Google Maps
5. Add your own branding

---

For detailed documentation, see README.md
