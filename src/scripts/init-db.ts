#!/usr/bin/env tsx
/**
 * Database initialization script for production deployment
 * This script ensures the database is properly set up before the app starts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeDatabase() {
    try {
        console.log('⏳ Initializing database...')

        // Test database connection
        await prisma.$connect()
        console.log('✅ Database connection successful')

        // Check if database has tables
        const userCount = await prisma.user.count()
        const sectorCount = await prisma.sector.count()
        const alertCount = await prisma.alert.count()

        console.log(`📊 Database stats:`)
        console.log(`   - Users: ${userCount}`)
        console.log(`   - Sectors: ${sectorCount}`)
        console.log(`   - Alerts: ${alertCount}`)

        console.log('✅ Database initialization complete')
    } catch (error) {
        console.error('❌ Database initialization failed:', error)
        console.error('\nPlease ensure:')
        console.error('1. DATABASE_URL environment variable is set')
        console.error('2. Database file/connection is accessible')
        console.error('3. Prisma migrations have been run: npm run db:push')
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

initializeDatabase()
