import { NextRequest, NextResponse } from 'next/server'

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
  'POWERGRID.NS': 'Power Grid Corporation',
  'BAJFINANCE.NS': 'Bajaj Finance',
  'INDUSINDBK.NS': 'IndusInd Bank',
  'ASIANPAINT.NS': 'Asian Paints',
  'TITAN.NS': 'Titan Company',
  'GRASIM.NS': 'Grasim Industries',
  'COALINDIA.NS': 'Coal India',
  'UPL.NS': 'UPL',
  'JSWSTEEL.NS': 'JSW Steel',
  'BPCL.NS': 'Bharat Petroleum',
  'SUNPHARMA.NS': 'Sun Pharma'
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

// Chart data fetching for different periods
async function fetchChartData(symbol: string, period: string = '1d') {
  try {
    let interval = '5m'
    let range = '1d'
    
    // Determine interval and range based on period
    switch (period) {
      case '1d':
        interval = '5m'
        range = '1d'
        break
      case '5d':
        interval = '15m'
        range = '5d'
        break
      case '1mo':
        interval = '1h'
        range = '1mo'
        break
      case '3mo':
        interval = '1d'
        range = '3mo'
        break
      case '6mo':
        interval = '1d'
        range = '6mo'
        break
      case '1y':
        interval = '1d'
        range = '1y'
        break
      default:
        interval = '5m'
        range = '1d'
    }
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      const result = data.chart?.result?.[0]
      
      if (result && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps = result.timestamp
        const quotes = result.indicators.quote[0]
        const closes = quotes.close || []
        
        const chartData = []
        
        // Limit data points based on period for better performance
        let maxPoints = 30
        if (period === '5d') maxPoints = 50
        if (period === '1mo') maxPoints = 30
        if (period === '3mo') maxPoints = 90
        if (period === '6mo') maxPoints = 180
        if (period === '1y') maxPoints = 252 // ~1 year of trading days
        
        // Sample data points if too many
        const step = Math.max(1, Math.floor(timestamps.length / maxPoints))
        
        for (let i = 0; i < timestamps.length; i += step) {
          const timestamp = timestamps[i]
          const price = closes[i]
          
          if (price && !isNaN(price)) {
            const time = new Date(timestamp * 1000)
            let timeStr = ''
            
            if (period === '1d' || period === '5d') {
              timeStr = time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            } else if (period === '1mo') {
              timeStr = time.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })
            } else {
              timeStr = time.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })
            }
            
            chartData.push({
              time: timeStr,
              price: parseFloat(price.toFixed(2))
            })
          }
        }
        
        return chartData
      }
    }
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol} (${period}):`, error)
  }
  
  // Fallback: generate mock chart data
  const stock = await fetchStockDetails(symbol)
  if (stock) {
    const basePrice = stock.price
    const data = []
    let points = 30
    let variation = 0.02
    
    if (period === '5d') {
      points = 50
      variation = 0.05
    } else if (period === '1mo') {
      points = 30
      variation = 0.15
    } else if (period === '3mo') {
      points = 90
      variation = 0.25
    } else if (period === '6mo') {
      points = 180
      variation = 0.35
    } else if (period === '1y') {
      points = 252
      variation = 0.50
    }
    
    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Daily intervals for longer periods
      const randomVariation = (Math.random() - 0.5) * basePrice * variation
      const trend = (points - i) * 0.5 // Add slight upward trend
      const price = basePrice + randomVariation + trend
      
      let timeStr = ''
      if (period === '1d' || period === '5d') {
        timeStr = time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } else {
        timeStr = time.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
      
      data.push({
        time: timeStr,
        price: parseFloat(price.toFixed(2))
      })
    }
    
    return data
  }
  
  return []
}

async function fetchStockDetails(symbol: string) {
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
        const change = meta.regularMarketChange || 0
        const changePercent = meta.regularMarketChangePercent || 0

        return {
          symbol,
          name: STOCK_NAMES[symbol] || meta.symbol || symbol.replace('.NS', ''),
          price: parseFloat(currentPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: formatVolume(meta.regularMarketVolume || 0),
          marketCap: formatMarketCap(meta.marketCap || 0),
          dayHigh: parseFloat((meta.regularMarketDayHigh || currentPrice).toFixed(2)),
          dayLow: parseFloat((meta.regularMarketDayLow || currentPrice).toFixed(2)),
          previousClose: parseFloat((meta.regularMarketPreviousClose || currentPrice).toFixed(2)),
          open: parseFloat((meta.regularMarketOpen || currentPrice).toFixed(2)),
          week52High: parseFloat((meta.fiftyTwoWeekHigh || currentPrice * 1.2).toFixed(2)),
          week52Low: parseFloat((meta.fiftyTwoWeekLow || currentPrice * 0.8).toFixed(2)),
          pe: meta.trailingPE || null,
          eps: meta.epsTrailingTwelveMonths || null,
          dividend: meta.dividendYield ? parseFloat((meta.dividendYield * 100).toFixed(2)) : null,
          beta: meta.beta || null
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching details for ${symbol}:`, error)
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const period = searchParams.get('period') || '1d'
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }
    
    // Validate period
    const validPeriods = ['1d', '5d', '1mo', '3mo', '6mo', '1y']
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Valid periods: 1d, 5d, 1mo, 3mo, 6mo, 1y' },
        { status: 400 }
      )
    }
    
    // Fetch stock details and chart data
    const [stock, chartData] = await Promise.all([
      fetchStockDetails(symbol),
      fetchChartData(symbol, period)
    ])
    
    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      stock, 
      chartData,
      period 
    })
  } catch (error) {
    console.error('Error fetching stock details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock details' },
      { status: 500 }
    )
  }
}