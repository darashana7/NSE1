import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface JWTPayload {
    userId: string
    telegramId: string
}

// Get user from token
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

// GET - Fetch user's search history
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const searchType = searchParams.get('type') || undefined

        const searchHistory = await prisma.searchHistory.findMany({
            where: {
                userId,
                ...(searchType && { searchType: searchType as any })
            },
            orderBy: { searchedAt: 'desc' },
            take: limit
        })

        // Get unique recent searches for suggestions
        const uniqueSearches = await prisma.searchHistory.findMany({
            where: { userId },
            select: { query: true, searchType: true, resultSymbol: true, resultName: true },
            distinct: ['query'],
            orderBy: { searchedAt: 'desc' },
            take: 10
        })

        return NextResponse.json({
            history: searchHistory,
            suggestions: uniqueSearches
        })

    } catch (error) {
        console.error('Error fetching search history:', error)
        return NextResponse.json(
            { error: 'Failed to fetch search history' },
            { status: 500 }
        )
    }
}

// POST - Add a new search to history
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { query, searchType = 'STOCK', resultSymbol, resultName } = body

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            )
        }

        const searchEntry = await prisma.searchHistory.create({
            data: {
                userId,
                query: query.trim(),
                searchType,
                resultSymbol,
                resultName
            }
        })

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId,
                action: 'SEARCH',
                details: { query, searchType, resultSymbol }
            }
        })

        return NextResponse.json(searchEntry, { status: 201 })

    } catch (error) {
        console.error('Error saving search:', error)
        return NextResponse.json(
            { error: 'Failed to save search' },
            { status: 500 }
        )
    }
}

// DELETE - Clear search history
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserFromRequest(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.searchHistory.deleteMany({
            where: { userId }
        })

        return NextResponse.json({ success: true, message: 'Search history cleared' })

    } catch (error) {
        console.error('Error clearing search history:', error)
        return NextResponse.json(
            { error: 'Failed to clear search history' },
            { status: 500 }
        )
    }
}
