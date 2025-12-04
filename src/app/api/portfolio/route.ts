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

// GET - Fetch user's portfolios
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const portfolios = await prisma.portfolio.findMany({
            where: { userId },
            include: {
                holdings: true,
                _count: { select: { holdings: true } }
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'asc' }
            ]
        })

        // Calculate portfolio totals
        const portfoliosWithTotals = portfolios.map(portfolio => {
            const totalValue = portfolio.holdings.reduce((sum, h) =>
                sum + (h.currentPrice || h.avgBuyPrice) * h.quantity, 0)
            const totalCost = portfolio.holdings.reduce((sum, h) =>
                sum + h.avgBuyPrice * h.quantity, 0)
            const totalProfitLoss = totalValue - totalCost
            const totalProfitLossPct = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

            return {
                ...portfolio,
                totalValue,
                totalCost,
                totalProfitLoss,
                totalProfitLossPct
            }
        })

        return NextResponse.json(portfoliosWithTotals)

    } catch (error) {
        console.error('Error fetching portfolios:', error)
        return NextResponse.json(
            { error: 'Failed to fetch portfolios' },
            { status: 500 }
        )
    }
}

// POST - Create a new portfolio
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, isDefault = false } = body

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Portfolio name is required' },
                { status: 400 }
            )
        }

        // Check if name already exists
        const existing = await prisma.portfolio.findUnique({
            where: {
                userId_name: { userId, name: name.trim() }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'A portfolio with this name already exists' },
                { status: 400 }
            )
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.portfolio.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const portfolio = await prisma.portfolio.create({
            data: {
                userId,
                name: name.trim(),
                description: description?.trim(),
                isDefault
            }
        })

        return NextResponse.json(portfolio, { status: 201 })

    } catch (error) {
        console.error('Error creating portfolio:', error)
        return NextResponse.json(
            { error: 'Failed to create portfolio' },
            { status: 500 }
        )
    }
}
