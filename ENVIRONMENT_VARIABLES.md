# ========================================
# NSE Stock Dashboard - Environment Variables
# ========================================

# Database Configuration
# ----------------------
# For LOCAL development (SQLite):
DATABASE_URL="file:./db/custom.db"

# For PRODUCTION on Vercel/Serverless (PostgreSQL required):
# DATABASE_URL="postgresql://username:password@host:5432/database_name"

# For PRODUCTION on Railway (PostgreSQL):
# DATABASE_URL="postgresql://username:password@host:5432/database_name"

# For PRODUCTION with Supabase:
# DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# For PRODUCTION with Neon:
# DATABASE_URL="postgresql://username:password@xxx.neon.tech/dbname"

# ========================================
# Application Settings
# ========================================

# Node Environment (set by deployment platform usually)
NODE_ENV="production"

# Next.js
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# ========================================
# IMPORTANT NOTES FOR DEPLOYMENT
# ========================================

# 1. VERCEL DEPLOYMENT:
#    - MUST use PostgreSQL (SQLite won't work)
#    - Set DATABASE_URL in Vercel dashboard → Settings → Environment Variables
#    - Vercel will automatically detect Prisma and run 'prisma generate'

# 2. RAILWAY DEPLOYMENT:
#    - Can use PostgreSQL (recommended) or SQLite
#    - Railway provides PostgreSQL database with automatic DATABASE_URL
#    - Add build command: npm run build
#    - Add start command: npm start

# 3. RENDER DEPLOYMENT:
#    - Can use PostgreSQL or SQLite
#    - Set environment variables in dashboard
#    - Build command: npm install && npx prisma generate && npx prisma db push && npm run build
#    - Start command: npm start

# 4. GENERAL NOTES:
#    - Copy this file to .env and update values
#    - Never commit .env to git (already in .gitignore)
#    - Each deployment platform needs DATABASE_URL set
#    - After changing schema, run: npx prisma db push (dev) or npx prisma migrate deploy (prod)
