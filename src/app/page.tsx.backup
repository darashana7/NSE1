'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, TrendingUp, TrendingDown, Star, Eye, EyeOff, RefreshCw, Activity, Calendar, Bell, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { LiveStockTicker } from '@/components/LiveStockTicker'
import { AlertDialog } from '@/components/AlertDialog'
import { AlertManager } from '@/components/AlertManager'
import { AdvancedChart } from '@/components/AdvancedChart'
import { SectorDashboard } from '@/components/SectorDashboard'
import { StockComparison } from '@/components/StockComparison'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useToast } from '@/hooks/use-toast'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  dayHigh: number
  dayLow: number
  previousClose: number
  open: number
}

interface ChartData {
  time: string
  price: number
}

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function StocksDashboard() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [chartPeriod, setChartPeriod] = useState('1d')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [marketIndices, setMarketIndices] = useState<{
    nifty50: { price: number; change: number; changePercent: number } | null
    sensex: { price: number; change: number; changePercent: number } | null
    bankNifty: { price: number; change: number; changePercent: number } | null
  }>({
    nifty50: null,
    sensex: null,
    bankNifty: null
  })

  // Popular NSE stocks
  const popularStocks = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS'
  ]

  useEffect(() => {
    loadTrendingStocks()
    loadWatchlist()
    loadMarketIndices()

    // Set up real-time updates
    const interval = setInterval(() => {
      loadTrendingStocks()
      loadWatchlist()
      loadMarketIndices()
      if (selectedStock) {
        loadStockDetails(selectedStock.symbol, chartPeriod)
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [selectedStock?.symbol, chartPeriod])

  const loadTrendingStocks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stocks/trending')
      const data = await response.json()
      setTrendingStocks(data)
    } catch (error) {
      console.error('Error loading trending stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist')
      const data = await response.json()
      setWatchlist(data)
    } catch (error) {
      console.error('Error loading watchlist:', error)
    }
  }

  const loadMarketIndices = async () => {
    try {
      const response = await fetch('/api/indices')
      if (response.ok) {
        const data = await response.json()
        setMarketIndices({
          nifty50: data.nifty50 || null,
          sensex: data.sensex || null,
          bankNifty: data.bankNifty || null
        })
      }
    } catch (error) {
      console.error('Error loading market indices:', error)
    }
  }

  const searchStocks = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStockDetails = async (symbol: string, period: string = '1d') => {
    try {
      setChartLoading(true)
      const response = await fetch(`/api/stocks/details?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}`)
      const data = await response.json()
      setSelectedStock(data.stock)
      setChartData(data.chartData)
    } catch (error) {
      console.error('Error loading stock details:', error)
    } finally {
      setChartLoading(false)
    }
  }

  const toggleWatchlist = async (symbol: string, name: string) => {
    try {
      const response = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, name })
      })

      if (response.ok) {
        const result = await response.json()
        loadWatchlist()

        // Show toast notification
        toast({
          title: result.action === 'added' ? '✓ Added to Watchlist' : '✓ Removed from Watchlist',
          description: `${name} (${symbol.replace('.NS', '')}) has been ${result.action === 'added' ? 'added to' : 'removed from'} your watchlist.`,
          duration: 3000,
        })
      } else {
        toast({
          title: '✗ Error',
          description: 'Failed to update watchlist. Please try again.',
          variant: 'destructive',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      toast({
        title: '✗ Error',
        description: 'An error occurred. Please check your connection.',
        variant: 'destructive',
        duration: 3000,
      })
    }
  }

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol)
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`
    return `₹${num.toFixed(2)}`
  }

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-center space-y-2 flex-1">
                <h1 className="text-4xl font-bold text-foreground">NSE Live Stocks</h1>
                <p className="text-muted-foreground">Real-time Indian stock market data</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-500" />
                  Live
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadTrendingStocks()
                    loadWatchlist()
                    if (selectedStock) {
                      loadStockDetails(selectedStock.symbol)
                    }
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                placeholder="Search stocks (e.g., RELIANCE, TCS, HDFCBANK)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchStocks()}
                className="flex-1"
              />
              <Button onClick={searchStocks} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => loadStockDetails(stock.symbol, chartPeriod)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{stock.symbol}</h3>
                        <Badge variant="secondary">{stock.name}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(stock.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {formatChange(stock.change, stock.changePercent)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWatchlist(stock.symbol, stock.name)
                        }}
                      >
                        {isInWatchlist(stock.symbol) ? (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Stock Ticker */}
        <LiveStockTicker symbols={popularStocks} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                <TabsTrigger value="alerts"><Bell className="w-4 h-4 mr-1" />Alerts</TabsTrigger>
                <TabsTrigger value="sectors"><BarChart3 className="w-4 h-4 mr-1" />Sectors</TabsTrigger>
                <TabsTrigger value="comparison">Compare</TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trending Stocks</CardTitle>
                    <CardDescription>Most active NSE stocks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trendingStocks.map((stock) => (
                          <div
                            key={stock.symbol}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => loadStockDetails(stock.symbol, chartPeriod)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{stock.symbol}</h3>
                                <Badge variant="secondary">{stock.name}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Vol: {stock.volume}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(stock.price)}</p>
                              {formatChange(stock.change, stock.changePercent)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="watchlist" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Watchlist</CardTitle>
                    <CardDescription>Your tracked stocks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {watchlist.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No stocks in watchlist. Add stocks from search results.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {watchlist.map((stock) => (
                          <div
                            key={stock.symbol}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => loadStockDetails(stock.symbol, chartPeriod)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{stock.symbol}</h3>
                                <Badge variant="secondary">{stock.name}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(stock.price)}</p>
                              {formatChange(stock.change, stock.changePercent)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <AlertManager />
              </TabsContent>

              <TabsContent value="sectors" className="space-y-4">
                <SectorDashboard />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <StockComparison />
              </TabsContent>
            </Tabs>

            {/* Stock Details and Chart */}
            {selectedStock && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {selectedStock.symbol}
                      <Badge variant="secondary">{selectedStock.name}</Badge>
                    </CardTitle>
                    <AlertDialog
                      symbol={selectedStock.symbol}
                      name={selectedStock.name}
                      currentPrice={selectedStock.price}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Chart Period:</span>
                      <Select value={chartPeriod} onValueChange={setChartPeriod}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">1 Day</SelectItem>
                          <SelectItem value="5d">5 Days</SelectItem>
                          <SelectItem value="1mo">1 Month</SelectItem>
                          <SelectItem value="3mo">3 Months</SelectItem>
                          <SelectItem value="6mo">6 Months</SelectItem>
                          <SelectItem value="1y">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedStock && loadStockDetails(selectedStock.symbol, chartPeriod)}
                      disabled={chartLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${chartLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-2xl font-bold">{formatNumber(selectedStock.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Day Change</p>
                      {formatChange(selectedStock.change, selectedStock.changePercent)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Day Range</p>
                      <p className="font-semibold">
                        {formatNumber(selectedStock.dayLow)} - {formatNumber(selectedStock.dayHigh)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-semibold">{selectedStock.volume}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Open</p>
                      <p className="font-semibold">{formatNumber(selectedStock.open)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Close</p>
                      <p className="font-semibold">{formatNumber(selectedStock.previousClose)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="font-semibold">{selectedStock.marketCap}</p>
                    </div>
                  </div>

                  {/* Advanced Chart with Technical Indicators */}
                  <AdvancedChart symbol={selectedStock.symbol} period={chartPeriod} />

                  {(selectedStock.week52High || selectedStock.week52Low || selectedStock.eps || selectedStock.dividend) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedStock.week52High && (
                        <div>
                          <p className="text-sm text-muted-foreground">52 Week High</p>
                          <p className="font-semibold">{formatNumber(selectedStock.week52High)}</p>
                        </div>
                      )}
                      {selectedStock.week52Low && (
                        <div>
                          <p className="text-sm text-muted-foreground">52 Week Low</p>
                          <p className="font-semibold">{formatNumber(selectedStock.week52Low)}</p>
                        </div>
                      )}
                      {selectedStock.eps && (
                        <div>
                          <p className="text-sm text-muted-foreground">EPS</p>
                          <p className="font-semibold">₹{selectedStock.eps.toFixed(2)}</p>
                        </div>
                      )}
                      {selectedStock.dividend && (
                        <div>
                          <p className="text-sm text-muted-foreground">Dividend</p>
                          <p className="font-semibold">{selectedStock.dividend.toFixed(2)}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">NIFTY 50</span>
                      {marketIndices.nifty50 && (
                        <div className="text-xs font-semibold">
                          {marketIndices.nifty50.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                    {marketIndices.nifty50 ? (
                      <Badge className={marketIndices.nifty50.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {marketIndices.nifty50.changePercent >= 0 ? '+' : ''}{marketIndices.nifty50.changePercent.toFixed(2)}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Loading...</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">SENSEX</span>
                      {marketIndices.sensex && (
                        <div className="text-xs font-semibold">
                          {marketIndices.sensex.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                    {marketIndices.sensex ? (
                      <Badge className={marketIndices.sensex.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {marketIndices.sensex.changePercent >= 0 ? '+' : ''}{marketIndices.sensex.changePercent.toFixed(2)}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Loading...</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">BANK NIFTY</span>
                      {marketIndices.bankNifty && (
                        <div className="text-xs font-semibold">
                          {marketIndices.bankNifty.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                    {marketIndices.bankNifty ? (
                      <Badge className={marketIndices.bankNifty.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {marketIndices.bankNifty.changePercent >= 0 ? '+' : ''}{marketIndices.bankNifty.changePercent.toFixed(2)}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Loading...</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularStocks.map((symbol) => (
                    <Badge
                      key={symbol}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => loadStockDetails(symbol)}
                    >
                      {symbol.replace('.NS', '')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}