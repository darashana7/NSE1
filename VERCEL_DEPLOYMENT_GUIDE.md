# Vercel Deployment Guide for NSE Stock Dashboard

## ⚠️ CRITICAL: Database Configuration Required

Your app uses Prisma with a database. **Vercel requires PostgreSQL** because it has a read-only filesystem (SQLite won't work).

---

## Quick Start: Deploy to Vercel in 3 Steps

### **Step 1: Set Up PostgreSQL Database**

Choose ONE option:

#### **Option A: Vercel Postgres (Easiest)**
1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Copy the `DATABASE_URL` from the `.env.local` tab

#### **Option B: Supabase (Free tier)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings** → **Database**
4. Copy the **Connection string** (Session mode)

#### **Option C: Neon (Serverless)**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from **Connection Details**

---

### **Step 2: Configure Environment Variables in Vercel**

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add the following variable:

```
Name: DATABASE_URL
Value: postgresql://[your-connection-string-here]
```

**Example values:**
```bash
# Vercel Postgres
DATABASE_URL=postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require

# Supabase
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Neon
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
```

3. Make sure to set it for **Production**, **Preview**, and **Development** environments

---

### **Step 3: Deploy**

#### **Option 1: Deploy via Vercel Dashboard**
1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect Next.js and deploy

#### **Option 2: Deploy via CLI**
```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

The deployment will:
1. Install dependencies
2. Generate Prisma client
3. Apply database migrations
4. Build Next.js app
5. Deploy to Vercel

---

## Database Migration

When deploying for the **first time**, or after schema changes:

### Automatic (Handled in Build)
The `vercel.json` configuration runs migrations automatically:
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

### Manual Migration (if needed)
```bash
# Connect to your production database
DATABASE_URL="your-prod-database-url" npx prisma migrate deploy
```

---

## Testing After Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Navigate to `/alerts` page
3. Try creating a new alert
4. Check the `/sectors` page
5. Verify all functionality works

### Check Logs
If something fails:
1. Vercel Dashboard → Your Project → **Deployment**
2. Click on the latest deployment
3. View **Build Logs** and **Function Logs**

---

## Common Issues & Solutions

### ❌ "Environment variable not found: DATABASE_URL"
**Solution:** Add `DATABASE_URL` to Vercel environment variables (Step 2)

### ❌ "Can't reach database server"
**Solutions:**
- Verify the connection string is correct
- Check database is running/accessible
- For Supabase: Use **Session mode** connection string (port 6543)
- For Neon: Ensure `?sslmode=require` is in the URL

### ❌ "Table does not exist"
**Solution:** Migrations didn't run. Check build logs and verify `vercel.json` config.

### ❌ "PrismaClient validation failed"
**Solution:** Run `npx prisma generate` and redeploy

---

## Local Development

For local development, you can use PostgreSQL or SQLite:

### Using PostgreSQL locally:
```bash
# Install PostgreSQL
# Create database
createdb nsedb

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nsedb"

# Run migrations
npm run db:push

# Start dev server
npm run dev
```

### Using SQLite locally (development only):
```bash
# Update .env
DATABASE_URL="file:./db/custom.db"

# Update prisma/schema.prisma
# datasource db {
#   provider = "sqlite"
#   url      = env("DATABASE_URL")
# }

# Run migrations
npm run db:push

# Start dev server
npm run dev
```

⚠️ **Remember:** Always switch back to PostgreSQL before deploying to Vercel!

---

## Environment Variables Checklist

Before deploying, ensure these are set in Vercel:

- ✅ `DATABASE_URL` - PostgreSQL connection string

Optional variables:
- `NODE_ENV` - Set to `production` (usually auto-set by Vercel)

---

## Support & Resources

- **Vercel Postgres:** https://vercel.com/docs/storage/vercel-postgres
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Next.js on Vercel:** https://nextjs.org/docs/app/building-your-application/deploying

---

## Need Help?

1. Check Vercel deployment logs
2. Verify `DATABASE_URL` is correctly set
3. Test database connection with `npx prisma studio` (locally)
4. Check GitHub Issues or create a new one

---

**Last Updated:** 2025-12-04  
**Status:** ✅ Ready for Vercel Deployment
