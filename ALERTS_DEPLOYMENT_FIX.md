# Alerts Page Deployment Fix

## Issues Fixed

### 1. **Prisma Client Connection Pool Exhaustion**
**Problem**: Each API route was creating a new `PrismaClient()` instance, causing connection pool exhaustion in production.

**Solution**: Created a singleton Prisma Client instance in `src/lib/prisma.ts` that reuses the same connection across all API routes.

**Files Modified**:
- ✅ Created `src/lib/prisma.ts` (singleton pattern)
- ✅ Updated `src/app/api/alert/list/route.ts`
- ✅ Updated `src/app/api/alert/create/route.ts`
- ✅ Updated `src/app/api/alert/delete/route.ts`
- ✅ Updated `src/app/api/alert/check/route.ts`
- ✅ Updated `src/app/api/sectors/list/route.ts`
- ✅ Updated `src/app/api/sectors/performance/route.ts`

### 2. **Database Not Initialized in Production**
**Problem**: The SQLite database file doesn't exist in production after deployment.

**Solution**: Added database initialization scripts and build steps.

**Files Modified**:
- ✅ Created `src/scripts/init-db.ts` (database setup verification)
- ✅ Updated `package.json` (added `postbuild` and `db:init` scripts)

---

## Deployment Steps for Production

### For Vercel Deployment:

⚠️ **Important**: Vercel has **read-only filesystem** in production. SQLite databases won't work on Vercel!

**Option 1: Switch to PostgreSQL (Recommended for Vercel)**

1. **Set up a PostgreSQL database** (Vercel Postgres, Supabase, or Neon)

2. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Set environment variable in Vercel**:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

4. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

**Option 2: Use a Different Platform (for SQLite)**

If you want to keep SQLite, deploy to platforms that support writable filesystems:
- Railway
- Render
- DigitalOcean App Platform
- Your own VPS

### For Railway/Render/Other Platforms:

1. **Ensure DATABASE_URL is set**:
   ```bash
   # For SQLite
   DATABASE_URL="file:./db/custom.db"
   
   # For PostgreSQL
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

2. **Add build commands** in your deployment platform:
   ```bash
   # Install dependencies
   npm install
   
   # Generate Prisma Client
   npx prisma generate
   
   # Push database schema (or migrate)
   npx prisma db push   # for development/SQLite
   # OR
   npx prisma migrate deploy   # for production/PostgreSQL
   
   # Build the app
   npm run build
   ```

3. **Start command**:
   ```bash
   npm start
   ```

---

## Local Testing

### Test the fixes locally:

1. **Clean and rebuild**:
   ```bash
   # Clean build artifacts
   rm -rf .next node_modules/.cache
   
   # Regenerate Prisma Client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Build for production
   npm run build
   ```

2. **Test database connection**:
   ```bash
   npm run db:init
   ```

3. **Start production server locally**:
   ```bash
   npm start
   ```

4. **Test alerts page**:
   - Navigate to `http://localhost:3000/alerts`
   - Try creating an alert
   - Verify the alert appears in the list
   - Check browser console for errors

---

## Debugging Production Issues

### Check these if alerts page still doesn't work:

1. **Database Connection**:
   ```bash
   # Check if DATABASE_URL is set
   echo $DATABASE_URL
   
   # Test Prisma connection
   npx prisma studio
   ```

2. **API Route Errors**:
   - Check deployment logs for errors
   - Look for "PrismaClient" or database-related errors
   - Verify all API routes return proper responses:
     - `/api/alert/list?status=all`
     - `/api/alert/create` (POST)
     - `/api/alert/delete?id=xxx` (DELETE)

3. **Frontend Console Errors**:
   - Open browser DevTools → Console
   - Look for failed API calls
   - Check Network tab for 500/404 errors

4. **Check Prisma Client Generation**:
   ```bash
   # Should exist in node_modules
   ls -la node_modules/@prisma/client
   
   # Regenerate if missing
   npx prisma generate
   ```

---

## Common Error Messages and Solutions

### Error: "PrismaClient is unable to be run in the browser"
**Solution**: Make sure API routes use `import { prisma } from '@/lib/prisma'` and not direct PrismaClient import

### Error: "Can't reach database server"
**Solution**: 
- Check DATABASE_URL is correctly set
- For SQLite: Ensure `db` directory exists and is writable
- For PostgreSQL: Verify connection string and network access

### Error: "Environment variable not found: DATABASE_URL"
**Solution**: Add to `.env` file or deployment platform environment variables

### Error: "Table does not exist"
**Solution**: Run `npx prisma db push` or `npx prisma migrate deploy`

### Error: "Too many Prisma Clients are already running"
**Solution**: Fixed by singleton pattern in `src/lib/prisma.ts`

---

## Production Checklist

Before deploying, verify:

- [ ] Database URL is set in environment variables
- [ ] Prisma Client is generated (`npx prisma generate`)
- [ ] Database schema is applied (`npx prisma db push` or migrate)
- [ ] Build succeeds locally (`npm run build`)
- [ ] All API routes use singleton Prisma Client from `@/lib/prisma`
- [ ] For Vercel: Using PostgreSQL (not SQLite)
- [ ] For other platforms: Database directory is writable
- [ ] Environment variables are set in deployment platform
- [ ] Test alerts page functionality after deployment

---

## Environment Variables Required

```bash
# Database connection
DATABASE_URL="file:./db/custom.db"  # SQLite
# OR
DATABASE_URL="postgresql://..."     # PostgreSQL

# Optional: Node environment
NODE_ENV="production"
```

---

## Rollback Instructions

If deployment fails, you can rollback the Prisma changes:

1. Revert to direct PrismaClient imports in API routes
2. Remove `src/lib/prisma.ts`
3. Keep the database initialization fixes

However, the singleton pattern is **recommended** and should not cause issues.

---

## Next Steps

1. **Deploy with fixes** using the steps above
2. **Monitor logs** for any database connection errors
3. **Test alerts functionality** thoroughly in production
4. **Set up database backups** (especially for production data)

---

## Support Resources

- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [Next.js 16 Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

**Last Updated**: 2025-12-04  
**Status**: ✅ Fixed - Ready for Deployment
