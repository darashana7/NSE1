'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, TrendingDown, Star, RefreshCw } from 'lucide-react'
import { LiveStockTicker } from '@/components/LiveStockTicker'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface Stock {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: string
}

export default function HomePage() {
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Stock[]>([])
    const [trendingStocks, setTrendingStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(false)
    const [marketIndices, setMarketIndices] = useState<{
        nifty50: { price: number; change: number; changePercent: number } | null
        sensex: { price: number; change: number; changePercent: number } | null
        bankNifty: { price: number; change: number; changePercent: number } | null
    }>({
        nifty50: null,
        sensex: null,
        bankNifty: null
    })

    const popularStocks = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS'
    ]

    useEffect(() => {
        loadTrendingStocks()
        loadMarketIndices()

        const interval = setInterval(() => {
            loadTrendingStocks()
            loadMarketIndices()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

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

    const toggleWatchlist = async (symbol: string, name: string) => {
        try {
            const response = await fetch('/api/watchlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, name })
            })

            if (response.ok) {
                const result = await response.json()
                toast({
                    title: result.action === 'added' ? '✓ Added to Watchlist' : '✓ Removed from Watchlist',
                    description: `${name} (${symbol.replace('.NS', '')}) has been ${result.action === 'added' ? 'added to' : 'removed from'} your watchlist.`,
                    duration: 3000,
                })
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error)
        }
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
            <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Hero Section */}
                <div className="gradient-purple-subtle rounded-2xl p-8 md:p-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
                        NSE Live Stocks
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Real-time Indian stock market data at your fingertips
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto flex gap-2">
                        <Input
                            placeholder="Search stocks (e.g., RELIANCE, TCS, HDFCBANK)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchStocks()}
                            className="flex-1 h-12 text-lg"
                        />
                        <Button onClick={searchStocks} disabled={loading} size="lg" className="gradient-purple">
                            <Search className="w-5 h-5 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle>Search Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {searchResults.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                                                onClick={() => toggleWatchlist(stock.symbol, stock.name)}
                                            >
                                                <Star className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Live Ticker */}
                <LiveStockTicker symbols={popularStocks} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Market Overview */}
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle>Market Overview</CardTitle>
                            <CardDescription>Major Indian indices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium">NIFTY 50</span>
                                    {marketIndices.nifty50 && (
                                        <div className="text-lg font-bold">
                                            {marketIndices.nifty50.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>
                                {marketIndices.nifty50 ? (
                                    <Badge className={marketIndices.nifty50.changePercent >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                                        {marketIndices.nifty50.changePercent >= 0 ? '+' : ''}{marketIndices.nifty50.changePercent.toFixed(2)}%
                                    </Badge>
                                ) : (
                                    <Skeleton className="h-6 w-16" />
                                )}
                            </div>

                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium">SENSEX</span>
                                    {marketIndices.sensex && (
                                        <div className="text-lg font-bold">
                                            {marketIndices.sensex.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>
                                {marketIndices.sensex ? (
                                    <Badge className={marketIndices.sensex.changePercent >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                                        {marketIndices.sensex.changePercent >= 0 ? '+' : ''}{marketIndices.sensex.changePercent.toFixed(2)}%
                                    </Badge>
                                ) : (
                                    <Skeleton className="h-6 w-16" />
                                )}
                            </div>

                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium">BANK NIFTY</span>
                                    {marketIndices.bankNifty && (
                                        <div className="text-lg font-bold">
                                            {marketIndices.bankNifty.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>
                                {marketIndices.bankNifty ? (
                                    <Badge className={marketIndices.bankNifty.changePercent >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                                        {marketIndices.bankNifty.changePercent >= 0 ? '+' : ''}{marketIndices.bankNifty.changePercent.toFixed(2)}%
                                    </Badge>
                                ) : (
                                    <Skeleton className="h-6 w-16" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trending Stocks */}
                    <Card className="lg:col-span-2 card-hover">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Trending Stocks</CardTitle>
                                    <CardDescription>Most active NSE stocks</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadTrendingStocks}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading && trendingStocks.length === 0 ? (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <Skeleton className="h-12 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {trendingStocks.map((stock) => (
                                        <div
                                            key={stock.symbol}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                </div>
            </div>
        </div>
    )
}
