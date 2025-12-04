import { NextRequest, NextResponse } from 'next/server'
import { SECTORS_DATA } from '@/lib/sectorsData'

export async function GET(request: NextRequest) {
    try {
        // Return sectors from static data
        const sectorsWithStats = SECTORS_DATA.map((sector) => ({
            id: sector.id,
            name: sector.name,
            description: sector.description,
            stockCount: sector.stocks.length,
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
