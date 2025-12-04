import { NextRequest, NextResponse } from 'next/server'
import { SECTORS_DATA, SectorData } from '@/lib/sectorsData'

// Helper to fetch current stock prices from Yahoo Finance
async function getStockPrice(symbol: string) {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        })

        if (response.ok) {
            const data = await response.json()
            const result = data.chart?.result?.[0]

            if (result && result.meta) {
                const meta = result.meta
                const currentPrice = meta.regularMarketPrice
                const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice

                // Calculate change manually (Yahoo Finance returns 0 when market is closed)
                const change = currentPrice - previousClose
                const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

                return {
                    price: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2)),
                }
            }
        }
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error)
    }

    return null
}

// Helper to fetch prices for multiple stocks with timeout
async function getStockPrices(stocks: { symbol: string; name: string }[]) {
    const prices: { [key: string]: any } = {}

    // Limit to first 5 stocks per sector for better performance
    const limitedStocks = stocks.slice(0, 5)

    // Process stocks one at a time with longer timeout
    for (const stock of limitedStocks) {
        try {
            // Add timeout for each request
            const timeoutPromise = new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            )
            const fetchPromise = getStockPrice(stock.symbol)
            const priceData = await Promise.race([fetchPromise, timeoutPromise])

            if (priceData) {
                prices[stock.symbol] = {
                    ...priceData,
                    name: stock.name,
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${stock.symbol}:`, error)
        }
    }

    return prices
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sectorId = searchParams.get('sectorId')
        const sectorName = searchParams.get('sectorName')

        // Use static sectors data (no database required)
        let sectors: SectorData[] = [...SECTORS_DATA]

        // Filter by sector if specified
        if (sectorId) {
            sectors = sectors.filter((s) => s.id === sectorId)
        } else if (sectorName) {
            sectors = sectors.filter(
                (s) => s.name.toLowerCase() === sectorName.toLowerCase()
            )
        }

        if (sectors.length === 0) {
            return NextResponse.json(
                { error: 'No sectors found' },
                { status: 404 }
            )
        }

        // Calculate performance for each sector
        const sectorPerformance = await Promise.all(
            sectors.map(async (sector) => {
                const prices = await getStockPrices(sector.stocks)
                const stocksWithPrices = Object.entries(prices)
                const totalStocks = stocksWithPrices.length

                if (totalStocks === 0) {
                    return {
                        id: sector.id,
                        name: sector.name,
                        description: sector.description,
                        totalStocks: sector.stocks.length,
                        avgChange: 0,
                        avgChangePercent: 0,
                        gainers: 0,
                        losers: 0,
                        topGainers: [],
                        topLosers: [],
                    }
                }

                const sumChangePercent = stocksWithPrices.reduce(
                    (sum, [_, data]) => sum + (data.changePercent || 0),
                    0
                )
                const avgChangePercent = sumChangePercent / totalStocks

                const gainers = stocksWithPrices.filter(
                    ([_, data]) => data.changePercent > 0
                ).length
                const losers = stocksWithPrices.filter(
                    ([_, data]) => data.changePercent < 0
                ).length

                // Find top gainers and losers
                const stockPerformance = stocksWithPrices
                    .map(([symbol, data]) => ({
                        symbol,
                        name: data.name || symbol,
                        price: data.price,
                        change: data.change,
                        changePercent: data.changePercent,
                    }))
                    .sort((a, b) => b.changePercent - a.changePercent)

                const topGainers = stockPerformance.filter(s => s.changePercent > 0).slice(0, 5)
                const topLosers = stockPerformance.filter(s => s.changePercent < 0).slice(-5).reverse()

                return {
                    id: sector.id,
                    name: sector.name,
                    description: sector.description,
                    totalStocks: sector.stocks.length,
                    avgChange: 0,
                    avgChangePercent: parseFloat(avgChangePercent.toFixed(2)),
                    gainers,
                    losers,
                    topGainers,
                    topLosers,
                    allStocks: stockPerformance,
                }
            })
        )

        return NextResponse.json({
            sectors: sectorPerformance,
            totalSectors: sectorPerformance.length,
        })
    } catch (error) {
        console.error('Error fetching sector performance:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sector performance' },
            { status: 500 }
        )
    }
}
