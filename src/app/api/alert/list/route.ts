import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const status = searchParams.get('status') // 'active', 'triggered', 'all'

        let whereClause: any = {}

        if (userId) {
            whereClause.userId = userId
        }

        if (status === 'active') {
            whereClause.isActive = true
            whereClause.isTriggered = false
        } else if (status === 'triggered') {
            whereClause.isTriggered = true
        }

        const alerts = await prisma.alert.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(alerts)
    } catch (error) {
        console.error('Error fetching alerts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        )
    }
}
