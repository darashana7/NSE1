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

// GET - Fetch holdings for a specific portfolio
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: portfolioId } = await params

        // Verify portfolio belongs to user
        const portfolio = await prisma.portfolio.findFirst({
            where: { id: portfolioId, userId }
        })

        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
        }

        const holdings = await prisma.portfolioHolding.findMany({
            where: { portfolioId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(holdings)

    } catch (error) {
        console.error('Error fetching holdings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch holdings' },
            { status: 500 }
        )
    }
}

// POST - Add a holding to portfolio
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: portfolioId } = await params

        // Verify portfolio belongs to user
        const portfolio = await prisma.portfolio.findFirst({
            where: { id: portfolioId, userId }
        })

        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
        }

        const body = await request.json()
        const { symbol, name, quantity, avgBuyPrice } = body

        if (!symbol || !name || !quantity || !avgBuyPrice) {
            return NextResponse.json(
                { error: 'Symbol, name, quantity, and average buy price are required' },
                { status: 400 }
            )
        }

        // Check if holding already exists - if so, update it
        const existingHolding = await prisma.portfolioHolding.findUnique({
            where: {
                portfolioId_symbol: { portfolioId, symbol }
            }
        })

        let holding
        if (existingHolding) {
            // Calculate new average price
            const totalShares = existingHolding.quantity + quantity
            const newAvgPrice = (
                (existingHolding.avgBuyPrice * existingHolding.quantity) +
                (avgBuyPrice * quantity)
            ) / totalShares

            holding = await prisma.portfolioHolding.update({
                where: { id: existingHolding.id },
                data: {
                    quantity: totalShares,
                    avgBuyPrice: newAvgPrice
                }
            })
        } else {
            holding = await prisma.portfolioHolding.create({
                data: {
                    portfolioId,
                    symbol,
                    name,
                    quantity,
                    avgBuyPrice
                }
            })
        }

        return NextResponse.json(holding, { status: existingHolding ? 200 : 201 })

    } catch (error) {
        console.error('Error adding holding:', error)
        return NextResponse.json(
            { error: 'Failed to add holding' },
            { status: 500 }
        )
    }
}

// DELETE - Remove a holding from portfolio
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: portfolioId } = await params
        const { searchParams } = new URL(request.url)
        const symbol = searchParams.get('symbol')

        if (!symbol) {
            return NextResponse.json(
                { error: 'Symbol is required' },
                { status: 400 }
            )
        }

        // Verify portfolio belongs to user
        const portfolio = await prisma.portfolio.findFirst({
            where: { id: portfolioId, userId }
        })

        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
        }

        await prisma.portfolioHolding.delete({
            where: {
                portfolioId_symbol: { portfolioId, symbol }
            }
        })

        return NextResponse.json({ success: true, message: 'Holding removed' })

    } catch (error) {
        console.error('Error removing holding:', error)
        return NextResponse.json(
            { error: 'Failed to remove holding' },
            { status: 500 }
        )
    }
}
