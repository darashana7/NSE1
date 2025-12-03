import { NextRequest, NextResponse } from 'next/server'

// Market indices symbols
const INDICES = {
    nifty50: '^NSEI',
    sensex: '^BSESN',
    bankNifty: '^NSEBANK'
}

export async function GET() {
    try {
        const results: any = {}

        // Fetch all indices in parallel
        const [niftyResponse, sensexResponse, bankNiftyResponse] = await Promise.all([
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${INDICES.nifty50}`),
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${INDICES.sensex}`),
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${INDICES.bankNifty}`)
        ])

        // Process NIFTY 50
        if (niftyResponse.ok) {
            const niftyData = await niftyResponse.json()
            const niftyMeta = niftyData.chart?.result?.[0]?.meta
            if (niftyMeta) {
                const currentPrice = niftyMeta.regularMarketPrice
                const previousClose = niftyMeta.previousClose || niftyMeta.chartPreviousClose || currentPrice
                const change = currentPrice - previousClose
                const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

                results.nifty50 = {
                    price: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2))
                }
            }
        }

        // Process SENSEX
        if (sensexResponse.ok) {
            const sensexData = await sensexResponse.json()
            const sensexMeta = sensexData.chart?.result?.[0]?.meta
            if (sensexMeta) {
                const currentPrice = sensexMeta.regularMarketPrice
                const previousClose = sensexMeta.previousClose || sensexMeta.chartPreviousClose || currentPrice
                const change = currentPrice - previousClose
                const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

                results.sensex = {
                    price: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2))
                }
            }
        }

        // Process BANK NIFTY
        if (bankNiftyResponse.ok) {
            const bankNiftyData = await bankNiftyResponse.json()
            const bankNiftyMeta = bankNiftyData.chart?.result?.[0]?.meta
            if (bankNiftyMeta) {
                const currentPrice = bankNiftyMeta.regularMarketPrice
                const previousClose = bankNiftyMeta.previousClose || bankNiftyMeta.chartPreviousClose || currentPrice
                const change = currentPrice - previousClose
                const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

                results.bankNifty = {
                    price: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2))
                }
            }
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error('Error fetching market indices:', error)
        return NextResponse.json(
            { error: 'Failed to fetch market indices' },
            { status: 500 }
        )
    }
}
