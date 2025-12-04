#!/usr/bin/env tsx
/**
 * Initialize Database Schema for Production
 * This script creates the database migration files if they don't exist
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

async function setupDatabase() {
    console.log('🚀 Setting up database for production deployment...\n')

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        console.error('❌ ERROR: DATABASE_URL environment variable is not set')
        console.log('\n📝 Please set DATABASE_URL in your .env file:')
        console.log('   For local PostgreSQL:')
        console.log('   DATABASE_URL="postgresql://postgres:password@localhost:5432/nsedb"\n')
        console.log('   For Vercel Postgres:')
        console.log('   DATABASE_URL="postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb?sslmode=require"\n')
        process.exit(1)
    }

    console.log('✅ DATABASE_URL is set')

    // Check if migrations directory exists
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')

    try {
        // Generate Prisma Client
        console.log('\n📦 Generating Prisma Client...')
        execSync('npx prisma generate', { stdio: 'inherit' })
        console.log('✅ Prisma Client generated')

        // Push schema to database (for development)
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n🔄 Pushing schema to database...')
            execSync('npx prisma db push', { stdio: 'inherit' })
            console.log('✅ Schema pushed to database')
        } else {
            // For production, use migrations
            console.log('\n🔄 Applying migrations...')
            execSync('npx prisma migrate deploy', { stdio: 'inherit' })
            console.log('✅ Migrations applied')
        }

        console.log('\n✅ Database setup complete!')
        console.log('\n📊 You can view your database with: npx prisma studio')

    } catch (error) {
        console.error('\n❌ Database setup failed:', error)
        console.log('\n🔍 Troubleshooting:')
        console.log('1. Verify your DATABASE_URL is correct')
        console.log('2. Ensure PostgreSQL database is running and accessible')
        console.log('3. Check your database credentials')
        console.log('4. Try running: npx prisma migrate dev --name init')
        process.exit(1)
    }
}

setupDatabase()
