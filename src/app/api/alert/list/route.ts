import { NextRequest, NextResponse } from 'next/server'
import { getAlerts } from '@/lib/alertsStore'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') as 'active' | 'triggered' | 'all' | null

        const alerts = getAlerts(status || 'all')

        return NextResponse.json(alerts)
    } catch (error) {
        console.error('Error fetching alerts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        )
    }
}
