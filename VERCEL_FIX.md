# 🚀 Quick Fix: Vercel Deployment Error

## The Problem

Your app is failing to deploy on Vercel because:
- ❌ **SQLite doesn't work on Vercel** (read-only filesystem)
- ✅ **PostgreSQL is required** for Vercel deployments

## The Solution (3 Steps)

### **1️⃣ Set Up PostgreSQL Database**

Choose the **easiest option** for you:

#### Option A: Vercel Postgres (Recommended - Built-in)
```
1. Go to Vercel Dashboard
2. Select your project
3. Click "Storage" tab → "Create Database" → "Postgres"
4. Copy the DATABASE_URL from the .env.local tab
```

#### Option B: Supabase (Free Forever Tier)
```
1. Go to https://supabase.com
2. Create new project
3. Project Settings → Database → Copy connection string (Session mode)
```

#### Option C: Neon (Serverless Postgres)
```
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
```

---

### **2️⃣ Add DATABASE_URL to Vercel**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   ```
   Name:  DATABASE_URL
   Value: [paste your PostgreSQL connection string]
   ```
3. Select all environments: **Production**, **Preview**, **Development**
4. Click **Save**

**Example values:**
```bash
# Vercel Postgres
postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require

# Supabase
postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Neon
postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
```

---

### **3️⃣ Redeploy**

#### Via Vercel Dashboard:
```
1. Go to Deployments tab
2. Click "..." on latest deployment → "Redeploy"
```

#### Via CLI:
```bash
vercel --prod
```

#### Via Git:
```bash
git add .
git commit -m "fix: switch to PostgreSQL for Vercel"
git push
```

---

## ✅ Verify Deployment

After deployment completes:

1. Visit: `https://your-app.vercel.app/alerts`
2. Try creating an alert
3. Check if it saves successfully

---

## 🐛 Still Getting Errors?

### Check #1: DATABASE_URL is set correctly
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Make sure DATABASE_URL exists and has correct value
```

### Check #2: View deployment logs
```
Vercel Dashboard → Deployments → Click latest → View Function Logs
Look for errors mentioning "database", "Prisma", or "connection"
```

### Check #3: Common Error Messages

**"Environment variable not found: DATABASE_URL"**
→ Add DATABASE_URL to Vercel environment variables

**"Can't reach database server"**
→ Check your database connection string is correct
→ For Supabase: use session mode (port 6543), not transaction mode

**"Table does not exist"**
→ Migrations didn't run. Check build logs

---

## 📁 Files Modified

These files were updated to support PostgreSQL + Vercel:

- ✅ `prisma/schema.prisma` - Changed provider to postgresql
- ✅ `package.json` - Updated build scripts
- ✅ `vercel.json` - Added Vercel-specific configuration
- ✅ `src/scripts/setup-db.ts` - Database setup automation
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - Full deployment guide

---

## 🔧 Local Development

Want to test locally first?

```bash
# Option 1: Use existing database from Vercel/Supabase/Neon
# Add to .env:
DATABASE_URL="postgresql://[your-connection-string]"

# Option 2: Install PostgreSQL locally
# Windows: https://www.postgresql.org/download/windows/
# Then:
DATABASE_URL="postgresql://postgres:password@localhost:5432/nsedb"

# Setup database
npm run db:setup

# Start dev server
npm run dev
```

---

## 📚 Full Documentation

For complete details, see: **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**

---

## ⏱️ Estimated Time

- Setting up database: **2-5 minutes**
- Configuring Vercel: **1 minute**
- Deployment: **2-3 minutes**

**Total:** ~5-10 minutes

---

**Need help?** Check deployment logs in Vercel Dashboard or review the full guide.
