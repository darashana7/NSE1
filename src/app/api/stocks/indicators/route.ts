import { NextRequest, NextResponse } from 'next/server'
import {
    calculateAllIndicators,
    mergeIndicatorsWithChartData,
} from '@/lib/technicalIndicators'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const symbol = searchParams.get('symbol')
        const period = searchParams.get('period') || '1mo'

        if (!symbol) {
            return NextResponse.json(
                { error: 'Symbol is required' },
                { status: 400 }
            )
        }

        // Fetch stock details and chart data
        const detailsResponse = await fetch(
            `http://localhost:3000/api/stocks/details?symbol=${symbol}&period=${period}`,
            { cache: 'no-store' }
        )

        if (!detailsResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch stock data' },
                { status: 500 }
            )
        }

        const detailsData = await detailsResponse.json()
        const { chartData } = detailsData

        if (!chartData || chartData.length === 0) {
            return NextResponse.json(
                { error: 'Insufficient data for indicators' },
                { status: 400 }
            )
        }

        // Calculate all technical indicators
        const indicators = calculateAllIndicators(chartData)

        // Merge indicators with chart data
        const enrichedChartData = mergeIndicatorsWithChartData(
            chartData,
            indicators
        )

        return NextResponse.json({
            symbol,
            period,
            indicators,
            chartData: enrichedChartData,
            dataPoints: chartData.length,
        })
    } catch (error) {
        console.error('Error calculating indicators:', error)
        return NextResponse.json(
            { error: 'Failed to calculate indicators' },
            { status: 500 }
        )
    }
}
