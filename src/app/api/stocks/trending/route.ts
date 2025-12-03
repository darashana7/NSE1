import { NextRequest, NextResponse } from 'next/server'

// Popular NSE stocks to fetch real data for
const POPULAR_NSE_STOCKS = [
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
  'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS'
]

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
  'LT.NS': 'Larsen & Toubro'
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

export async function GET() {
  try {
    // Import yfinance dynamically
    const yf = await import('yfinance')

    const formattedStocks: any[] = []

    for (const symbol of POPULAR_NSE_STOCKS) {
      try {
        // Use the fetch method to get stock data
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

            formattedStocks.push({
              symbol,
              name: STOCK_NAMES[symbol] || meta.symbol || symbol.replace('.NS', ''),
              price: parseFloat(currentPrice.toFixed(2)),
              change: parseFloat(change.toFixed(2)),
              changePercent: parseFloat(changePercent.toFixed(2)),
              volume: formatVolume(meta.regularMarketVolume || 0),
              marketCap: formatMarketCap(meta.marketCap || 0),
              dayHigh: parseFloat((meta.regularMarketDayHigh || currentPrice).toFixed(2)),
              dayLow: parseFloat((meta.regularMarketDayLow || currentPrice).toFixed(2)),
              previousClose: parseFloat((previousClose).toFixed(2)),
              open: parseFloat((meta.regularMarketOpen || currentPrice).toFixed(2))
            })
          }
        }
      } catch (stockError) {
        console.error(`Error processing ${symbol}:`, stockError)
        continue
      }
    }

    // Sort by volume (most active first)
    formattedStocks.sort((a, b) => {
      const volumeA = parseFloat(a.volume.replace(/[^\d.]/g, ''))
      const volumeB = parseFloat(b.volume.replace(/[^\d.]/g, ''))
      return volumeB - volumeA
    })

    return NextResponse.json(formattedStocks.length > 0 ? formattedStocks : getFallbackData())
  } catch (error) {
    console.error('Error fetching trending stocks:', error)
    return NextResponse.json(getFallbackData())
  }
}

function getFallbackData() {
  return [
    {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      price: 2845.30,
      change: 45.20,
      changePercent: 1.61,
      volume: '12.5L',
      marketCap: '18.9T',
      dayHigh: 2860.00,
      dayLow: 2820.10,
      previousClose: 2800.10,
      open: 2825.50
    },
    {
      symbol: 'TCS.NS',
      name: 'Tata Consultancy Services',
      price: 4125.80,
      change: -32.40,
      changePercent: -0.78,
      volume: '8.2L',
      marketCap: '15.2T',
      dayHigh: 4160.00,
      dayLow: 4100.00,
      previousClose: 4158.20,
      open: 4150.00
    }
  ]
}