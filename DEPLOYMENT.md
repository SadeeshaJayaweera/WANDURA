# 🚀 Wandura Deployment Guide

## Production Deployment Checklist

### Prerequisites
- [ ] PostgreSQL database (production)
- [ ] Stripe account with production keys
- [ ] Google Maps API key configured
- [ ] GitHub repository created

---

## Recommended: Deploy to Vercel

### Step 1: Prepare Your Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Wandura platform"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/your-username/wandura.git

# Push to GitHub
git push -u origin main
```

### Step 2: Set Up Production Database

#### Option A: Supabase (Recommended - Free Tier Available)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy the "Connection string" (with password)
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

#### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Copy connection string

#### Option C: Neon

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

### Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**

2. **Click "Add New Project"**

3. **Import your GitHub repository**

4. **Configure Project:**
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

5. **Add Environment Variables:**

Click "Environment Variables" and add:

```env
# Database
DATABASE_URL=your_production_database_url

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate_strong_secret_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

# App Config
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
PLATFORM_COMMISSION_RATE=0.10
```

6. **Click "Deploy"**

### Step 4: Run Database Migrations

After deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations
vercel env pull .env.production
npx prisma migrate deploy
```

### Step 5: Seed Database (Optional)

```bash
# If you want sample data in production
npm run prisma:seed
```

### Step 6: Configure Stripe Webhook

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to STRIPE_WEBHOOK_SECRET

---

## Alternative: Deploy to Railway

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Login and Init

```bash
railway login
railway init
```

### Step 3: Add PostgreSQL

```bash
railway add
# Select PostgreSQL
```

### Step 4: Set Environment Variables

```bash
railway variables set NEXTAUTH_SECRET=your_secret
railway variables set STRIPE_SECRET_KEY=sk_live_xxx
# ... add all other variables
```

### Step 5: Deploy

```bash
railway up
```

---

## Alternative: Deploy to DigitalOcean App Platform

### Step 1: Create App

1. Go to DigitalOcean
2. Create App
3. Connect GitHub repo

### Step 2: Configure

- Build Command: `npm run build`
- Run Command: `npm run start`
- Port: 3000

### Step 3: Add Database

- Add PostgreSQL database component
- Copy connection string

### Step 4: Add Environment Variables

Add all environment variables in the app settings

### Step 5: Deploy

Click "Deploy"

---

## Post-Deployment Tasks

### 1. Test Core Features

- [ ] Sign up / Sign in
- [ ] Worker search
- [ ] Create booking
- [ ] Payment flow
- [ ] Notifications

### 2. Set Up Monitoring

#### Vercel Analytics
```bash
# Already included in Vercel deployment
```

#### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 3. Set Up Email Notifications

#### Using Resend (Recommended)
```bash
npm install resend
```

Create `lib/email.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(email: string, data: any) {
  await resend.emails.send({
    from: 'Wandura <noreply@your-domain.com>',
    to: email,
    subject: 'Booking Confirmation',
    html: `<p>Your booking has been confirmed!</p>`,
  })
}
```

### 4. Configure Custom Domain

1. Go to Vercel Dashboard
2. Settings > Domains
3. Add your custom domain
4. Update DNS records
5. Update NEXTAUTH_URL in environment variables

### 5. Enable HTTPS (Automatic on Vercel)

Already enabled by default!

### 6. Set Up Backups

#### For Supabase:
- Automatic backups included

#### For Railway:
```bash
railway backup create
```

---

## Performance Optimizations

### 1. Enable Image Optimization

Already configured in `next.config.js`

### 2. Add CDN for Static Assets

Vercel CDN is automatic

### 3. Database Connection Pooling

Add to DATABASE_URL:
```
postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1
```

### 4. Enable Caching

Add in API routes:
```typescript
export const revalidate = 60 // Revalidate every 60 seconds
```

---

## Security Checklist

- [ ] All environment variables secured
- [ ] NEXTAUTH_SECRET is strong and random
- [ ] Stripe production keys configured
- [ ] Database connections use SSL
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Regular dependency updates

---

## Monitoring & Analytics

### 1. Vercel Analytics

```bash
# Add Vercel Analytics
npm install @vercel/analytics
```

Update `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Set Up Logging

Use Vercel's built-in logging or add:
- Logtail
- Datadog
- New Relic

---

## Cost Estimation

### Vercel
- **Hobby Plan**: Free
- **Pro Plan**: $20/month (recommended for production)

### Database
- **Supabase**: Free tier (up to 500MB)
- **Railway**: ~$5-10/month
- **Neon**: Free tier available

### Stripe
- 2.9% + $0.30 per transaction

### Total Monthly Cost (Estimated)
- **Development**: $0 (all free tiers)
- **Small Production**: $20-30/month
- **Medium Production**: $50-100/month

---

## Scaling Considerations

### When you need to scale:

1. **Upgrade Database**
   - Move to larger instance
   - Enable read replicas

2. **Enable Caching**
   - Redis for sessions
   - Cache worker searches

3. **Add Queue System**
   - BullMQ for background jobs
   - Email sending queue

4. **CDN for Media**
   - Cloudinary for images
   - Cloudflare for static assets

---

## Support & Maintenance

### Regular Tasks

- **Weekly**: Monitor error logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Yearly**: Database optimization

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update Prisma
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

---

## Rollback Plan

### If deployment fails:

1. **Vercel**: Use instant rollback in dashboard
2. **Railway**: `railway rollback`
3. **Database**: Restore from backup

---

## Success Metrics

Track these after deployment:

- [ ] Uptime > 99.9%
- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] Zero critical errors
- [ ] Successful payment rate > 95%

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://prisma.io/docs
- Stripe Docs: https://stripe.com/docs

---

## 🎉 Congratulations!

Your Wandura platform is now live in production!

Remember to:
- Monitor regularly
- Keep dependencies updated
- Backup database frequently
- Test new features thoroughly
- Listen to user feedback

Good luck with your platform! 🚀
