import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Cache for loaded stocks
let NSE_STOCKS: Array<{ symbol: string; name: string }> = []
let stocksLoaded = false

// Load stocks from CSV file
function loadStocksFromCSV() {
  if (stocksLoaded && NSE_STOCKS.length > 0) {
    return NSE_STOCKS
  }

  try {
    const csvPath = path.join(process.cwd(), 'India_Stock_Market_Tracker_v2.0 - Sheet8 (1).csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')

    NSE_STOCKS = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // Split by comma and remove \r if present
      const parts = trimmedLine.split(',')
      if (parts.length >= 2) {
        const symbol = parts[0].trim()
        const name = parts[1].trim().replace(/\r$/, '')

        if (symbol && name) {
          NSE_STOCKS.push({ symbol, name })
        }
      }
    }

    stocksLoaded = true
    console.log(`Loaded ${NSE_STOCKS.length} stocks from CSV`)
    return NSE_STOCKS
  } catch (error) {
    console.error('Error loading stocks from CSV:', error)
    // Fallback to empty array if CSV can't be loaded
    return []
  }
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

// Enhanced search with fuzzy matching
function searchStocks(query: string) {
  // Load stocks from CSV
  const stocks = loadStocksFromCSV()

  const lowerQuery = query.toLowerCase()
  const results = []

  for (const stock of stocks) {
    const symbolMatch = stock.symbol.toLowerCase().includes(lowerQuery)
    const nameMatch = stock.name.toLowerCase().includes(lowerQuery)

    // Calculate match score
    let score = 0
    let matchType = ''

    if (symbolMatch) {
      score += 100
      matchType += 'symbol'
    }

    if (nameMatch) {
      score += 50
      matchType += 'name'
    }

    // Partial word matching for better results
    const queryWords = lowerQuery.split(' ')
    const nameWords = stock.name.toLowerCase().split(' ')

    for (const queryWord of queryWords) {
      if (queryWord.length > 2) {
        for (const nameWord of nameWords) {
          if (nameWord.startsWith(queryWord)) {
            score += 25
            matchType += 'partial'
          }
        }
      }
    }

    if (score > 0) {
      results.push({
        ...stock,
        score,
        matchType
      })
    }
  }

  // Remove duplicates and sort by score
  const uniqueResults = results.filter((item, index, self) =>
    index === self.findIndex(t => t.symbol === item.symbol)
  )

  return uniqueResults.sort((a, b) => b.score - a.score)
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

// Yahoo Finance symbol search for stocks not in our database
async function searchYahooFinance(query: string) {
  try {
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`
    const response = await fetch(searchUrl)

    if (response.ok) {
      const data = await response.json()
      const quotes = data.quotes || []

      const results = []
      for (const quote of quotes) {
        if (quote.symbol && quote.symbol.endsWith('.NS')) {
          const stockData = await fetchStockData(quote.symbol, quote.shortname || quote.symbol)
          if (stockData) {
            results.push(stockData)
          }
        }
      }

      return results
    }
  } catch (error) {
    console.error('Yahoo Finance search error:', error)
  }

  return []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Step 1: Search in our local database first
    const localResults = searchStocks(query)

    // Step 2: Fetch real data for local results
    const localWithData = []
    const stockPromises = localResults.slice(0, 10).map(async (stock) => {
      const data = await fetchStockData(stock.symbol, stock.name)
      return data
    })

    const stockData = await Promise.all(stockPromises)
    stockData.forEach(data => {
      if (data) {
        localWithData.push(data)
      }
    })

    // Step 3: If no local results, search Yahoo Finance directly
    if (localResults.length === 0) {
      const yahooResults = await searchYahooFinance(query)
      return NextResponse.json(yahooResults.slice(0, 10))
    }

    // Step 4: Return local results with real data
    return NextResponse.json(localWithData.slice(0, 10))
  } catch (error) {
    console.error('Error searching stocks:', error)
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    )
  }
}