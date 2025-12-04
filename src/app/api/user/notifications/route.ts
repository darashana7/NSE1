import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface JWTPayload {
    userId: string
    telegramId: string
}

async function getUserFromRequest(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
        return decoded.userId
    } catch {
        return null
    }
}

// GET - Fetch user's notification settings
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let settings = await prisma.notificationSettings.findUnique({
            where: { userId }
        })

        // Create default settings if not exist
        if (!settings) {
            settings = await prisma.notificationSettings.create({
                data: { userId }
            })
        }

        return NextResponse.json(settings)

    } catch (error) {
        console.error('Error fetching notification settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch notification settings' },
            { status: 500 }
        )
    }
}

// PUT - Update notification settings
export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            telegramAlerts,
            priceAlerts,
            dailyDigest,
            weeklyReport,
            marketOpenAlert,
            marketCloseAlert,
            portfolioUpdateAlert
        } = body

        const settings = await prisma.notificationSettings.upsert({
            where: { userId },
            update: {
                ...(telegramAlerts !== undefined && { telegramAlerts }),
                ...(priceAlerts !== undefined && { priceAlerts }),
                ...(dailyDigest !== undefined && { dailyDigest }),
                ...(weeklyReport !== undefined && { weeklyReport }),
                ...(marketOpenAlert !== undefined && { marketOpenAlert }),
                ...(marketCloseAlert !== undefined && { marketCloseAlert }),
                ...(portfolioUpdateAlert !== undefined && { portfolioUpdateAlert })
            },
            create: {
                userId,
                telegramAlerts: telegramAlerts ?? true,
                priceAlerts: priceAlerts ?? true,
                dailyDigest: dailyDigest ?? false,
                weeklyReport: weeklyReport ?? false,
                marketOpenAlert: marketOpenAlert ?? false,
                marketCloseAlert: marketCloseAlert ?? false,
                portfolioUpdateAlert: portfolioUpdateAlert ?? true
            }
        })

        return NextResponse.json(settings)

    } catch (error) {
        console.error('Error updating notification settings:', error)
        return NextResponse.json(
            { error: 'Failed to update notification settings' },
            { status: 500 }
        )
    }
}
