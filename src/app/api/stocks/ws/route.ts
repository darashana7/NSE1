import { NextRequest, NextResponse } from 'next/server'

// This endpoint handles WebSocket upgrade requests for real-time stock updates
// Since Next.js doesn't support WebSocket natively in App Router,
// we'll use Server-Sent Events (SSE) which works better with Next.js

export const dynamic = 'force-dynamic'

interface StockPrice {
    symbol: string
    price: number
    change: number
    changePercent: number
    volume: string
    timestamp: number
    marketStatus: 'OPEN' | 'CLOSED' | 'PRE' | 'POST'
}

// Check if NSE market is currently open (9:15 AM - 3:30 PM IST, Mon-Fri)
function getMarketStatus(): 'OPEN' | 'CLOSED' | 'PRE' | 'POST' {
    const now = new Date()
    // Convert to IST (UTC+5:30)
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const hours = istTime.getHours()
    const minutes = istTime.getMinutes()
    const day = istTime.getDay() // 0 = Sunday, 6 = Saturday

    // Weekend
    if (day === 0 || day === 6) {
        return 'CLOSED'
    }

    const currentMinutes = hours * 60 + minutes
    const marketOpen = 9 * 60 + 15  // 9:15 AM
    const marketClose = 15 * 60 + 30 // 3:30 PM

    if (currentMinutes < marketOpen) {
        return 'PRE'
    } else if (currentMinutes >= marketOpen && currentMinutes < marketClose) {
        return 'OPEN'
    } else {
        return 'POST'
    }
}

async function fetchLivePrice(symbol: string): Promise<StockPrice | null> {
    try {
        // Use Yahoo Finance API to fetch real-time price
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`
        const response = await fetch(url, {
            cache: 'no-store',
            next: { revalidate: 0 }
        })

        if (!response.ok) return null

        const data = await response.json()
        const result = data.chart?.result?.[0]

        if (result?.meta) {
            const meta = result.meta
            const currentPrice = meta.regularMarketPrice || 0
            const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice

            // Calculate change manually (Yahoo Finance returns 0 when market is closed)
            const change = currentPrice - previousClose
            const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

            return {
                symbol,
                price: parseFloat(currentPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: formatVolume(meta.regularMarketVolume || 0),
                timestamp: Date.now(),
                marketStatus: getMarketStatus()
            }
        }
    } catch (error) {
        console.error(`Error fetching live price for ${symbol}:`, error)
    }
    return null
}

function formatVolume(volume: number): string {
    if (volume >= 1e7) return `${(volume / 1e7).toFixed(1)}Cr`
    if (volume >= 1e5) return `${(volume / 1e5).toFixed(1)}L`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
    return volume.toString()
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')

    if (!symbolsParam) {
        return NextResponse.json({ error: 'symbols parameter required' }, { status: 400 })
    }

    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean)

    if (symbols.length === 0) {
        return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 })
    }

    // Create a text encoder for SSE
    const encoder = new TextEncoder()

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
        async start(controller) {
            console.log(`[WebSocket] Started live feed for ${symbols.join(', ')}`)

            // Send connection established event
            const connectMsg = `data: ${JSON.stringify({
                type: 'connected',
                symbols,
                message: 'Live price updates started'
            })}\n\n`
            controller.enqueue(encoder.encode(connectMsg))

            // Function to fetch and broadcast prices
            const broadcastPrices = async () => {
                try {
                    const prices = await Promise.all(
                        symbols.map(symbol => fetchLivePrice(symbol))
                    )

                    const validPrices = prices.filter((p): p is StockPrice => p !== null)

                    if (validPrices.length > 0) {
                        const updateMsg = `data: ${JSON.stringify({
                            type: 'prices',
                            data: validPrices,
                            timestamp: Date.now()
                        })}\n\n`
                        controller.enqueue(encoder.encode(updateMsg))
                    }
                } catch (error) {
                    console.error('[WebSocket] Error broadcasting prices:', error)
                    const errorMsg = `data: ${JSON.stringify({
                        type: 'error',
                        message: 'Failed to fetch prices'
                    })}\n\n`
                    controller.enqueue(encoder.encode(errorMsg))
                }
            }

            // Send initial prices immediately
            await broadcastPrices()

            // Update every 3 seconds (Yahoo Finance respects this interval)
            const intervalId = setInterval(broadcastPrices, 3000)

            // Send heartbeat every 15 seconds to keep connection alive
            const heartbeatId = setInterval(() => {
                const heartbeatMsg = `data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`
                controller.enqueue(encoder.encode(heartbeatMsg))
            }, 15000)

            // Cleanup on client disconnect
            request.signal.addEventListener('abort', () => {
                console.log('[WebSocket] Client disconnected, cleaning up')
                clearInterval(intervalId)
                clearInterval(heartbeatId)
                controller.close()
            })
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    })
}
