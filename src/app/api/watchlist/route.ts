import { NextRequest, NextResponse } from 'next/server'
import { getWatchlist } from '@/lib/watchlistStore'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface JWTPayload {
  userId: string
  telegramId: string
}

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded.userId
  } catch {
    return null
  }
}

const STOCK_NAMES: { [key: string]: string } = {
  'RELIANCE.NS': 'Reliance Industries',
  'TCS.NS': 'Tata Consultancy Services',
  'HDFCBANK.NS': 'HDFC Bank',
  'INFY.NS': 'Infosys',
  'ICICIBANK.NS': 'ICICI Bank',
  'HINDUNILVR.NS': 'Hindustan Unilever',
  'SBIN.NS': 'State Bank of India',
  'BHARTIARTL.NS': 'Bharti Airtel',
  'KOTAKBANK.NS': 'Kotak Mahindra Bank',
  'LT.NS': 'Larsen & Toubro',
  'WIPRO.NS': 'Wipro',
  'AXISBANK.NS': 'Axis Bank',
  'MARUTI.NS': 'Maruti Suzuki',
  'HCLTECH.NS': 'HCL Technologies',
  'NTPC.NS': 'NTPC',
  'ULTRACEMCO.NS': 'UltraTech Cement',
  'ADANIPORTS.NS': 'Adani Ports',
  'TECHM.NS': 'Tech Mahindra',
  'TATAMOTORS.NS': 'Tata Motors',
  'POWERGRID.NS': 'Power Grid Corporation'
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `₹${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `₹${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e7) return `₹${(marketCap / 1e7).toFixed(2)}Cr`
  if (marketCap >= 1e5) return `₹${(marketCap / 1e5).toFixed(2)}L`
  return `₹${marketCap.toFixed(2)}`
}

function formatVolume(volume: number): string {
  if (volume >= 1e7) return `${(volume / 1e7).toFixed(1)}Cr`
  if (volume >= 1e5) return `${(volume / 1e5).toFixed(1)}L`
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
  return volume.toString()
}

async function fetchStockData(symbol: string, name: string) {
  try {
    // Use Yahoo Finance API directly
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    const response = await fetch(url)

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
          symbol,
          name,
          price: parseFloat(currentPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: formatVolume(meta.regularMarketVolume || 0),
          marketCap: formatMarketCap(meta.marketCap || 0),
          dayHigh: parseFloat((meta.regularMarketDayHigh || currentPrice).toFixed(2)),
          dayLow: parseFloat((meta.regularMarketDayLow || currentPrice).toFixed(2)),
          previousClose: parseFloat((previousClose).toFixed(2)),
          open: parseFloat((meta.regularMarketOpen || currentPrice).toFixed(2))
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request)

    let watchlistItems: { symbol: string; name: string; notes?: string | null }[] = []

    if (userId) {
      // Fetch from database for authenticated users
      const dbWatchlist = await prisma.watchlist.findMany({
        where: { userId },
        orderBy: [{ priority: 'desc' }, { addedAt: 'desc' }]
      })
      watchlistItems = dbWatchlist.map(item => ({
        symbol: item.symbol,
        name: item.name,
        notes: item.notes
      }))
    } else {
      // Fall back to in-memory store for unauthenticated users
      watchlistItems = getWatchlist()
    }

    if (watchlistItems.length === 0) {
      return NextResponse.json([])
    }

    // Fetch real data for all watchlist items with timeout protection
    const watchlistWithData: any[] = []
    const stockPromises = watchlistItems.map(async (item) => {
      try {
        // Add 5 second timeout to prevent hanging
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )

        const fetchPromise = fetchStockData(item.symbol, item.name)
        const data = await Promise.race([fetchPromise, timeoutPromise])
        return { ...data, notes: item.notes }
      } catch (error) {
        // If fetch fails, return basic info without live price data
        console.error(`Failed to fetch ${item.symbol}:`, error)
        return {
          symbol: item.symbol,
          name: item.name,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 'N/A',
          marketCap: 'N/A',
          dayHigh: 0,
          dayLow: 0,
          previousClose: 0,
          open: 0,
          notes: item.notes
        }
      }
    })

    const stockData = await Promise.all(stockPromises)
    stockData.forEach(data => {
      if (data) {
        watchlistWithData.push(data)
      }
    })

    return NextResponse.json(watchlistWithData)
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

// POST - Add stock to watchlist
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, name, notes } = body

    if (!symbol || !name) {
      return NextResponse.json(
        { error: 'Symbol and name are required' },
        { status: 400 }
      )
    }

    const watchlistItem = await prisma.watchlist.upsert({
      where: {
        userId_symbol: { userId, symbol }
      },
      update: { notes },
      create: {
        userId,
        symbol,
        name,
        notes
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'WATCHLIST_ADD',
        details: { symbol, name }
      }
    })

    return NextResponse.json(watchlistItem, { status: 201 })

  } catch (error) {
    console.error('Error adding to watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}

// DELETE - Remove stock from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    await prisma.watchlist.delete({
      where: {
        userId_symbol: { userId, symbol }
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'WATCHLIST_REMOVE',
        details: { symbol }
      }
    })

    return NextResponse.json({ success: true, message: 'Removed from watchlist' })

  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}