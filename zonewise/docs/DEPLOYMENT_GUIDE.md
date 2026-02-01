# ZoneWise V2 - Deployment Guide

## Overview

This guide covers deploying ZoneWise V2 to **Vercel** (recommended for frontend) and **Render.com** (for full-stack with backend).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Option 1: Deploy to Vercel](#option-1-deploy-to-vercel)
4. [Option 2: Deploy to Render.com](#option-2-deploy-to-rendercom)
5. [Database Setup](#database-setup)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account with access to `breverdbidder/zonewise-v2` repository
- Vercel account (free tier available) OR Render.com account
- Supabase account (for PostgreSQL database)
- Stripe account (for billing)
- Mapbox account (for maps)

---

## Environment Variables

### Required Environment Variables

Create a `.env` file or configure these in your hosting platform:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Authentication (Manus OAuth)
JWT_SECRET=your-jwt-secret-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=your-manus-app-id

# Owner Information
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Configuration
VITE_APP_TITLE=ZoneWise.AI
VITE_APP_LOGO=/logo.svg
NODE_ENV=production
```

### How to Get Environment Variables

**DATABASE_URL:**
1. Go to [Supabase](https://supabase.com)
2. Create a new project or use existing
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" for production)
5. Format: `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require`

**Manus OAuth Variables:**
- Contact Manus support or use your existing Manus app credentials
- `VITE_APP_ID`: Your Manus application ID
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `OWNER_OPEN_ID`: Your Manus user ID

**Stripe Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from Developers → API keys
3. Use **live** keys for production (starts with `sk_live_`)
4. Get webhook secret from Developers → Webhooks (after creating endpoint)

**Mapbox Token:**
- Not required as environment variable (configured in code)
- But ensure you have a Mapbox account for maps to work

---

## Option 1: Deploy to Vercel

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import `breverdbidder/zonewise-v2` from GitHub
4. Authorize Vercel to access your GitHub account if needed

### Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset:** Vite
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`
- **Development Command:** `pnpm dev`

### Step 3: Add Environment Variables

1. In project settings, go to **"Environment Variables"**
2. Add all variables from the [Environment Variables](#environment-variables) section
3. Set them for **Production**, **Preview**, and **Development** environments

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will provide a URL: `https://zonewise-v2.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to project settings → **"Domains"**
2. Add your custom domain (e.g., `app.zonewise.ai`)
3. Update DNS records as instructed by Vercel
4. SSL certificate will be auto-provisioned

### Step 6: Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click **"Add endpoint"**
3. Enter URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy the project

---

## Option 2: Deploy to Render.com

### Step 1: Connect GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select `breverdbidder/zonewise-v2` repository

### Step 2: Configure Service

**Basic Settings:**
- **Name:** `zonewise-v2`
- **Region:** Oregon (US West) or closest to your users
- **Branch:** `main`
- **Runtime:** Node

**Build Settings:**
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`

**Plan:**
- Start with **Starter** ($7/month) or **Free** tier for testing
- Upgrade to **Standard** for production

### Step 3: Add Environment Variables

1. In the service settings, go to **"Environment"**
2. Click **"Add Environment Variable"**
3. Add all variables from the [Environment Variables](#environment-variables) section

**Important:** Mark sensitive variables as **"Secret"**:
- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BUILT_IN_FORGE_API_KEY`

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy
3. Wait 3-5 minutes for build to complete
4. Your app will be available at: `https://zonewise-v2.onrender.com`

### Step 5: Configure Custom Domain (Optional)

1. Go to service settings → **"Custom Domain"**
2. Add your domain (e.g., `app.zonewise.ai`)
3. Update DNS records:
   - Add CNAME record pointing to `zonewise-v2.onrender.com`
4. SSL certificate will be auto-provisioned

### Step 6: Set Up Stripe Webhook

Same as Vercel instructions above, but use your Render.com URL:
`https://zonewise-v2.onrender.com/api/webhooks/stripe`

---

## Database Setup

### Step 1: Run Migrations

After deployment, you need to push the database schema:

**Option A: From Local Machine**

```bash
# Clone the repository
git clone https://github.com/breverdbidder/zonewise-v2.git
cd zonewise-v2

# Install dependencies
pnpm install

# Set DATABASE_URL environment variable
export DATABASE_URL="your-production-database-url"

# Push schema to database
pnpm db:push
```

**Option B: From Render.com Shell**

1. Go to your service in Render dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   pnpm db:push
   ```

### Step 2: Verify Database Tables

Connect to your Supabase database and verify these tables exist:

**Core Tables:**
- `users`
- `subscriptions`
- `usage_tracking`
- `properties`
- `exports`

**Reporting Tables (New):**
- `reports`
- `report_kpis`
- `report_sections`
- `development_scenarios`
- `report_comparisons`
- `report_analytics`

**Zoning Data Tables:**
- `jurisdictions`
- `zoning_districts`

### Step 3: Seed Initial Data (Optional)

If you need to populate jurisdictions and zoning districts:

```bash
# From local machine or Render shell
pnpm db:seed
```

---

## Post-Deployment Configuration

### 1. Test Authentication

1. Visit your deployed URL
2. Click **"Sign In"**
3. Verify Manus OAuth flow works
4. Check that user is created in database

### 2. Test Stripe Checkout

1. Go to **Pricing** page
2. Click **"Upgrade to Pro"**
3. Complete test checkout (use Stripe test card: `4242 4242 4242 4242`)
4. Verify subscription is created in database
5. Check Stripe dashboard for payment

### 3. Test Report Generation

1. Go to **Property Analysis** page
2. Select a jurisdiction and zoning district
3. Click **"Reports"** tab
4. Generate a test report
5. Verify all export formats download correctly (PDF, CSV, Excel, JSON)

### 4. Configure Stripe Webhook

1. Test webhook by completing a checkout
2. Check Render/Vercel logs for webhook events
3. Verify subscription status updates in database

### 5. Set Up Monitoring (Recommended)

**Sentry for Error Tracking:**
```bash
pnpm add @sentry/node @sentry/react
```

Add to `server/_core/index.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Uptime Monitoring:**
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Monitor: `https://your-domain.com/api/health`

---

## Troubleshooting

### Build Fails on Vercel/Render

**Error:** `Command failed with exit code 1`

**Solution:**
1. Check build logs for specific error
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

**Fix:**
```bash
# Test build locally first
pnpm install
pnpm build

# Check for TypeScript errors
pnpm tsc --noEmit
```

---

### Database Connection Fails

**Error:** `Connection terminated unexpectedly`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Ensure SSL mode is enabled: `?sslmode=require`
3. Check Supabase connection pooling is enabled
4. Whitelist Vercel/Render IP addresses in Supabase (if using IP restrictions)

**Fix:**
```bash
# Test connection locally
psql $DATABASE_URL
```

---

### Stripe Webhook Not Working

**Error:** Webhook signature verification failed

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Check webhook URL is correct: `https://your-domain.com/api/webhooks/stripe`
3. Ensure webhook is listening to correct events
4. Check Stripe dashboard for webhook delivery attempts

**Fix:**
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Check **"Recent deliveries"** for errors
4. Resend failed events for testing

---

### Reports Not Generating

**Error:** `Failed to generate report`

**Solution:**
1. Check server logs for specific error
2. Common issues:
   - Missing property data
   - S3 storage configuration
   - PDF generation library errors

**Fix:**
```bash
# Check if pdfkit is installed
pnpm list pdfkit

# Reinstall if needed
pnpm add pdfkit exceljs csv-stringify
```

---

### Environment Variables Not Loading

**Error:** `process.env.VARIABLE_NAME is undefined`

**Solution:**
1. Verify variables are set in hosting platform
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables

**Fix:**
1. Go to Vercel/Render dashboard
2. Settings → Environment Variables
3. Add missing variables
4. Trigger redeploy

---

## Performance Optimization

### 1. Enable Caching

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Enable Compression

Render.com enables gzip automatically. For Vercel, add:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

### 3. Database Connection Pooling

Use Supabase connection pooling:
```
postgresql://[user]:[password]@[host]:6543/[database]?pgbouncer=true
```

---

## Security Checklist

- [ ] All environment variables are set as **secrets**
- [ ] `NODE_ENV=production` is set
- [ ] Stripe webhook secret is configured
- [ ] Database uses SSL (`sslmode=require`)
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled (via Vercel/Render)
- [ ] Sensitive data is not logged
- [ ] JWT secret is strong (32+ characters)
- [ ] Stripe uses live keys (not test keys)
- [ ] Custom domain has SSL certificate

---

## Scaling Considerations

### When to Upgrade

**Vercel:**
- Free tier: 100GB bandwidth/month
- Pro tier ($20/mo): 1TB bandwidth, better performance
- Upgrade when you hit bandwidth limits

**Render.com:**
- Free tier: Limited hours, sleeps after inactivity
- Starter ($7/mo): Always on, 512MB RAM
- Standard ($25/mo): 2GB RAM, better performance
- Upgrade when you need more memory or uptime

### Database Scaling

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth
- Pro tier ($25/mo): 8GB database, 50GB bandwidth
- Upgrade when you hit storage or bandwidth limits

---

## Monitoring & Logs

### Vercel Logs

1. Go to project dashboard
2. Click **"Logs"** tab
3. View real-time logs
4. Filter by severity (info, warning, error)

### Render.com Logs

1. Go to service dashboard
2. Click **"Logs"** tab
3. View real-time logs
4. Download logs for analysis

### Database Logs

1. Go to Supabase dashboard
2. Click **"Logs"** section
3. View query performance
4. Identify slow queries

---

## Backup & Recovery

### Database Backups

**Supabase:**
- Automatic daily backups (Pro tier)
- Manual backups: Database → Backups → Create backup
- Download backups for local storage

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Code Backups

- All code is in GitHub: `breverdbidder/zonewise-v2`
- Create tags for releases:
  ```bash
  git tag -a v1.0.0 -m "Production release"
  git push origin v1.0.0
  ```

---

## Support

For deployment issues:
- **Vercel:** https://vercel.com/support
- **Render.com:** https://render.com/docs
- **Supabase:** https://supabase.com/support

For ZoneWise-specific issues:
- Check `REPORTING_SYSTEM_DOCUMENTATION.md`
- Review GitHub issues
- Contact development team

---

## Next Steps After Deployment

1. **Set up custom domain**
2. **Configure monitoring (Sentry, UptimeRobot)**
3. **Enable database backups**
4. **Test all features in production**
5. **Set up CI/CD for automatic deployments**
6. **Configure analytics (Google Analytics, Plausible)**
7. **Add status page (e.g., status.zonewise.ai)**
8. **Set up error alerting**
9. **Document runbooks for common issues**
10. **Plan for scaling (CDN, caching, database optimization)**

---

## Deployment Checklist

- [ ] GitHub repository connected
- [ ] All environment variables configured
- [ ] Database schema migrated
- [ ] Stripe webhook configured
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] Authentication tested
- [ ] Stripe checkout tested
- [ ] Report generation tested
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Error tracking configured
- [ ] Performance optimized
- [ ] Security checklist completed

---

**Congratulations! Your ZoneWise V2 application is now deployed and ready for production use.** 🚀
