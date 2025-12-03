import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const sectors = await prisma.sector.findMany({
            include: {
                _count: {
                    select: { stocks: true },
                },
            },
            orderBy: {
                name: 'asc',
            },
        })

        const sectorsWithStats = sectors.map((sector) => ({
            id: sector.id,
            name: sector.name,
            description: sector.description,
            stockCount: sector._count.stocks,
        }))

        return NextResponse.json(sectorsWithStats)
    } catch (error) {
        console.error('Error fetching sectors:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sectors' },
            { status: 500 }
        )
    }
}
