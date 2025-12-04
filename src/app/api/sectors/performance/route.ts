import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to fetch current stock prices
async function getStockPrices(symbols: string[]) {
    const prices: { [key: string]: any } = {}

    try {
        // Fetch prices for all symbols
        const pricePromises = symbols.map(async (symbol) => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/stocks/details?symbol=${symbol}&period=1d`,
                    { cache: 'no-store' }
                )
                const data = await response.json()
                if (data.stock) {
                    prices[symbol] = {
                        price: data.stock.price,
                        change: data.stock.change,
                        changePercent: data.stock.changePercent,
                    }
                }
            } catch (error) {
                console.error(`Error fetching price for ${symbol}:`, error)
            }
        })

        await Promise.all(pricePromises)
    } catch (error) {
        console.error('Error fetching stock prices:', error)
    }

    return prices
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sectorId = searchParams.get('sectorId')
        const sectorName = searchParams.get('sectorName')

        let whereClause: any = {}

        if (sectorId) {
            whereClause.id = sectorId
        } else if (sectorName) {
            whereClause.name = sectorName
        }

        // Fetch sectors with stocks
        const sectors = await prisma.sector.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            include: {
                stocks: true,
            },
        })

        if (sectors.length === 0) {
            return NextResponse.json(
                { error: 'No sectors found' },
                { status: 404 }
            )
        }

        // Calculate performance for each sector
        const sectorPerformance = await Promise.all(
            sectors.map(async (sector) => {
                const symbols = sector.stocks.map((stock) => stock.symbol)
                const prices = await getStockPrices(symbols)

                // Calculate sector metrics
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
                    .map(([symbol, data]) => {
                        const stock = sector.stocks.find((s) => s.symbol === symbol)
                        return {
                            symbol,
                            name: stock?.name || symbol,
                            price: data.price,
                            change: data.change,
                            changePercent: data.changePercent,
                        }
                    })
                    .sort((a, b) => b.changePercent - a.changePercent)

                const topGainers = stockPerformance.slice(0, 5)
                const topLosers = stockPerformance.slice(-5).reverse()

                return {
                    id: sector.id,
                    name: sector.name,
                    description: sector.description,
                    totalStocks: sector.stocks.length,
                    avgChange: 0,
                    avgChangePercent,
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
