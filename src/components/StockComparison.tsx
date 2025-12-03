'use client'

import { useState } from 'react'
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
import { TrendingUp, TrendingDown, X } from 'lucide-react'

interface StockMetric {
    symbol: string
    name: string
    currentPrice: number
    change: number
    changePercent: number
    performance: number
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

export function StockComparison() {
    const [symbols, setSymbols] = useState<string[]>([])
    const [inputSymbol, setInputSymbol] = useState('')
    const [period, setPeriod] = useState('1mo')
    const [comparisonData, setComparisonData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const addSymbol = () => {
        if (!inputSymbol.trim()) return

        const formattedSymbol = inputSymbol.toUpperCase().includes('.NS')
            ? inputSymbol.toUpperCase()
            : `${inputSymbol.toUpperCase()}.NS`

        if (symbols.includes(formattedSymbol)) {
            return
        }

        if (symbols.length >= 6) {
            alert('Maximum 6 stocks can be compared at once')
            return
        }

        setSymbols([...symbols, formattedSymbol])
        setInputSymbol('')
    }

    const removeSymbol = (symbol: string) => {
        setSymbols(symbols.filter((s) => s !== symbol))
        if (symbols.length <= 1) {
            setComparisonData(null)
        }
    }

    const compareStocks = async () => {
        if (symbols.length < 2) {
            alert('Please add at least 2 stocks to compare')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(
                `/api/sectors/compare?symbols=${symbols.join(',')}&period=${period}`
            )
            const data = await response.json()

            if (response.ok) {
                setComparisonData(data)
            } else {
                alert(data.error || 'Failed to load comparison data')
            }
        } catch (error) {
            console.error('Error comparing stocks:', error)
            alert('An error occurred while comparing stocks')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Stock Comparison Tool</CardTitle>
                    <CardDescription>
                        Add stocks to compare their performance side-by-side
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter stock symbol (e.g., RELIANCE, TCS)"
                                value={inputSymbol}
                                onChange={(e) => setInputSymbol(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
                            />
                            <Button onClick={addSymbol}>Add Stock</Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {symbols.map((symbol) => (
                                <Badge
                                    key={symbol}
                                    variant="secondary"
                                    className="px-3 py-1 text-sm"
                                >
                                    {symbol.replace('.NS', '')}
                                    <button
                                        onClick={() => removeSymbol(symbol)}
                                        className="ml-2 hover:text-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-2">
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
                            >
                                {loading ? 'Comparing...' : 'Compare Stocks'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading && <Skeleton className="h-[400px] w-full" />}

            {comparisonData && !loading && (
                <>
                    {/* Comparison Metrics Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Stock</th>
                                            <th className="text-right p-2">Current Price</th>
                                            <th className="text-right p-2">Day Change</th>
                                            <th className="text-right p-2">Period Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonData.stocks.map(
                                            (stock: StockMetric, index: number) => (
                                                <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                                                    <td className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
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
                                                    <td className="text-right p-2 font-semibold">
                                                        ₹{stock.currentPrice.toFixed(2)}
                                                    </td>
                                                    <td className="text-right p-2">
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
                                                    <td className="text-right p-2">
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Normalized Performance Chart</CardTitle>
                            <CardDescription>
                                All stocks start at 100 for easy comparison. Period: {period}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={comparisonData.normalizedChart}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip />
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
