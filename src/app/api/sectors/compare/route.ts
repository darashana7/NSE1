import { NextRequest, NextResponse } from 'next/server'

// Helper to fetch stock data with historical prices
async function getStockData(symbol: string, period: string, baseUrl: string) {
    try {
        const response = await fetch(
            `${baseUrl}/api/stocks/details?symbol=${symbol}&period=${period}`,
            { cache: 'no-store' }
        )
        const data = await response.json()
        return data
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
        return null
    }
}

// Normalize chart data to base 100
function normalizeChartData(
    stocksData: any[]
): { time: string;[key: string]: any }[] {
    if (stocksData.length === 0) return []

    // Get all unique time points
    const timePoints = new Set<string>()
    stocksData.forEach((stock) => {
        stock.chartData?.forEach((point: any) => timePoints.add(point.time))
    })

    const sortedTimes = Array.from(timePoints).sort()

    // Normalize each stock to base 100
    const normalized = sortedTimes.map((time) => {
        const point: any = { time }

        stocksData.forEach((stock) => {
            const dataPoint = stock.chartData?.find((d: any) => d.time === time)
            if (dataPoint && stock.basePrice) {
                const normalizedPrice = (dataPoint.price / stock.basePrice) * 100
                point[stock.symbol] = normalizedPrice
            }
        })

        return point
    })

    return normalized
}

export async function GET(request: NextRequest) {
    try {
        // Get base URL from request
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const host = request.headers.get('host') || 'localhost:3000'
        const baseUrl = `${protocol}://${host}`

        const { searchParams } = new URL(request.url)
        const symbolsParam = searchParams.get('symbols')
        const period = searchParams.get('period') || '1mo'

        if (!symbolsParam) {
            return NextResponse.json(
                { error: 'Symbols parameter is required (comma-separated)' },
                { status: 400 }
            )
        }

        const symbols = symbolsParam.split(',').map((s) => s.trim())

        if (symbols.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 symbols are required for comparison' },
                { status: 400 }
            )
        }

        if (symbols.length > 10) {
            return NextResponse.json(
                { error: 'Maximum 10 symbols can be compared at once' },
                { status: 400 }
            )
        }

        // Fetch data for all symbols
        const stockDataPromises = symbols.map(async (symbol) => {
            const data = await getStockData(symbol, period, baseUrl)
            if (data && data.stock && data.chartData) {
                return {
                    symbol: data.stock.symbol,
                    name: data.stock.name,
                    currentPrice: data.stock.price,
                    change: data.stock.change,
                    changePercent: data.stock.changePercent,
                    chartData: data.chartData,
                    basePrice: data.chartData[0]?.price || data.stock.price,
                }
            }
            return null
        })

        const stocksData = (await Promise.all(stockDataPromises)).filter(
            (data) => data !== null
        )

        if (stocksData.length === 0) {
            return NextResponse.json(
                { error: 'No valid stock data found' },
                { status: 404 }
            )
        }

        // Create normalized comparison chart
        const normalizedChart = normalizeChartData(stocksData)

        // Create comparison metrics
        const comparisonMetrics = stocksData.map((stock) => ({
            symbol: stock.symbol,
            name: stock.name,
            currentPrice: stock.currentPrice,
            change: stock.change,
            changePercent: stock.changePercent,
            performance:
                ((stock.currentPrice - stock.basePrice) / stock.basePrice) * 100,
        }))

        return NextResponse.json({
            period,
            stocks: comparisonMetrics,
            normalizedChart,
            comparedStocks: stocksData.length,
        })
    } catch (error) {
        console.error('Error comparing stocks:', error)
        return NextResponse.json(
            { error: 'Failed to compare stocks' },
            { status: 500 }
        )
    }
}
