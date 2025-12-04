'use client'

import { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, X, Plus, Search, AlertCircle, GitCompare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface StockMetric {
    symbol: string
    name: string
    currentPrice: number
    change: number
    changePercent: number
    performance: number
}

interface WatchlistItem {
    symbol: string
    name: string
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']

// Popular stocks for suggestions
const POPULAR_STOCKS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
    { symbol: 'WIPRO.NS', name: 'Wipro' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
]

export function StockComparison() {
    const { toast } = useToast()
    const [symbols, setSymbols] = useState<string[]>([])
    const [inputSymbol, setInputSymbol] = useState('')
    const [period, setPeriod] = useState('1mo')
    const [comparisonData, setComparisonData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [watchlistStocks, setWatchlistStocks] = useState<WatchlistItem[]>([])

    // Load watchlist stocks for suggestions
    useEffect(() => {
        loadWatchlist()
    }, [])

    const loadWatchlist = async () => {
        try {
            const response = await fetch('/api/watchlist')
            if (response.ok) {
                const data = await response.json()
                setWatchlistStocks(data)
            }
        } catch (error) {
            console.error('Error loading watchlist:', error)
        }
    }

    const addSymbol = (symbolToAdd?: string) => {
        const symbol = symbolToAdd || inputSymbol.trim()
        if (!symbol) return

        const formattedSymbol = symbol.toUpperCase().includes('.NS')
            ? symbol.toUpperCase()
            : `${symbol.toUpperCase()}.NS`

        if (symbols.includes(formattedSymbol)) {
            toast({
                title: 'Stock already added',
                description: `${formattedSymbol.replace('.NS', '')} is already in the comparison list`,
                variant: 'destructive',
                duration: 2000,
            })
            return
        }

        if (symbols.length >= 6) {
            toast({
                title: 'Maximum reached',
                description: 'Maximum 6 stocks can be compared at once',
                variant: 'destructive',
                duration: 2000,
            })
            return
        }

        setSymbols([...symbols, formattedSymbol])
        setInputSymbol('')
        setComparisonData(null) // Clear old comparison
    }

    const removeSymbol = (symbol: string) => {
        setSymbols(symbols.filter((s) => s !== symbol))
        if (symbols.length <= 2) {
            setComparisonData(null)
        }
    }

    const compareStocks = async () => {
        if (symbols.length < 2) {
            toast({
                title: 'Add more stocks',
                description: 'Please add at least 2 stocks to compare',
                variant: 'destructive',
                duration: 2000,
            })
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/sectors/compare?symbols=${symbols.join(',')}&period=${period}`
            )
            const data = await response.json()

            if (response.ok) {
                setComparisonData(data)
                toast({
                    title: '✓ Comparison Ready',
                    description: `Comparing ${data.comparedStocks} stocks over ${period}`,
                    duration: 2000,
                })
            } else {
                setError(data.error || 'Failed to load comparison data')
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to load comparison data',
                    variant: 'destructive',
                    duration: 3000,
                })
            }
        } catch (error) {
            console.error('Error comparing stocks:', error)
            setError('An error occurred while comparing stocks')
            toast({
                title: 'Error',
                description: 'An error occurred while comparing stocks',
                variant: 'destructive',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    const quickAddFromWatchlist = () => {
        if (watchlistStocks.length === 0) return

        const stocksToAdd = watchlistStocks.slice(0, Math.min(4, watchlistStocks.length))
        const newSymbols = stocksToAdd
            .map(s => s.symbol)
            .filter(s => !symbols.includes(s))
            .slice(0, 6 - symbols.length)

        setSymbols([...symbols, ...newSymbols])
    }

    return (
        <div className="space-y-6">
            {/* Input Card */}
            <Card className="gradient-purple-subtle">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <GitCompare className="w-8 h-8 text-purple-600" />
                        <div>
                            <CardTitle className="text-2xl">Stock Comparison Tool</CardTitle>
                            <CardDescription>
                                Add stocks to compare their performance side-by-side
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Add Stock Input */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter stock symbol (e.g., RELIANCE, TCS)"
                                    value={inputSymbol}
                                    onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={() => addSymbol()} className="gradient-purple">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Stock
                            </Button>
                        </div>

                        {/* Quick Add Buttons */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground">Quick Add:</span>
                                {POPULAR_STOCKS.slice(0, 6).map((stock) => (
                                    <Button
                                        key={stock.symbol}
                                        variant="outline"
                                        size="sm"
                                        disabled={symbols.includes(stock.symbol)}
                                        onClick={() => addSymbol(stock.symbol)}
                                        className="text-xs"
                                    >
                                        {stock.symbol.replace('.NS', '')}
                                    </Button>
                                ))}
                                {watchlistStocks.length > 0 && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={quickAddFromWatchlist}
                                        className="text-xs"
                                    >
                                        + From Watchlist
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Selected Stocks */}
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {symbols.length === 0 ? (
                                <span className="text-sm text-muted-foreground py-2">
                                    No stocks selected. Add at least 2 stocks to compare.
                                </span>
                            ) : (
                                symbols.map((symbol, index) => (
                                    <Badge
                                        key={symbol}
                                        className="px-3 py-1.5 text-sm flex items-center gap-2"
                                        style={{ backgroundColor: COLORS[index], color: 'white' }}
                                    >
                                        {symbol.replace('.NS', '')}
                                        <button
                                            onClick={() => removeSymbol(symbol)}
                                            className="hover:opacity-75 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))
                            )}
                        </div>

                        {/* Period Selection and Compare Button */}
                        <div className="flex gap-2 flex-wrap">
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-[150px]">
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

                            <Button
                                onClick={compareStocks}
                                disabled={symbols.length < 2 || loading}
                                className="gradient-purple min-w-[150px]"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Comparing...
                                    </>
                                ) : (
                                    <>
                                        <GitCompare className="w-4 h-4 mr-2" />
                                        Compare Stocks
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Card className="border-destructive/50">
                    <CardContent className="py-8">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                            <h3 className="text-lg font-semibold mb-2">Comparison Failed</h3>
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparison Results */}
            {comparisonData && !loading && !error && (
                <>
                    {/* Comparison Metrics Table */}
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>
                                Comparison over {period === '1d' ? '1 Day' : period === '5d' ? '5 Days' : period === '1mo' ? '1 Month' : period === '3mo' ? '3 Months' : period === '6mo' ? '6 Months' : '1 Year'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3 font-semibold">Stock</th>
                                            <th className="text-right p-3 font-semibold">Current Price</th>
                                            <th className="text-right p-3 font-semibold">Day Change</th>
                                            <th className="text-right p-3 font-semibold">Period Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonData.stocks.map(
                                            (stock: StockMetric, index: number) => (
                                                <tr key={stock.symbol} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: COLORS[index] }}
                                                            />
                                                            <div>
                                                                <div className="font-semibold">
                                                                    {stock.symbol.replace('.NS', '')}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {stock.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-right p-3 font-semibold">
                                                        ₹{stock.currentPrice.toFixed(2)}
                                                    </td>
                                                    <td className="text-right p-3">
                                                        <span
                                                            className={
                                                                stock.changePercent >= 0
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }
                                                        >
                                                            {stock.changePercent >= 0 ? '+' : ''}
                                                            {stock.changePercent.toFixed(2)}%
                                                        </span>
                                                    </td>
                                                    <td className="text-right p-3">
                                                        <Badge
                                                            className={
                                                                stock.performance >= 0
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                            }
                                                        >
                                                            {stock.performance >= 0 ? (
                                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                            ) : (
                                                                <TrendingDown className="w-3 h-3 mr-1" />
                                                            )}
                                                            {stock.performance >= 0 ? '+' : ''}
                                                            {stock.performance.toFixed(2)}%
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Normalized Comparison Chart */}
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle>Normalized Performance Chart</CardTitle>
                            <CardDescription>
                                All stocks start at 100 for easy comparison. Higher values indicate better performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={comparisonData.normalizedChart}>
                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                        <XAxis
                                            dataKey="time"
                                            fontSize={12}
                                            tick={{ fill: 'currentColor' }}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tick={{ fill: 'currentColor' }}
                                            domain={['dataMin - 5', 'dataMax + 5']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Legend />
                                        {comparisonData.stocks.map(
                                            (stock: StockMetric, index: number) => (
                                                <Line
                                                    key={stock.symbol}
                                                    type="monotone"
                                                    dataKey={stock.symbol}
                                                    stroke={COLORS[index]}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name={stock.symbol.replace('.NS', '')}
                                                    connectNulls
                                                />
                                            )
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
