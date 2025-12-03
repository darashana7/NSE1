'use client'

import { useState, useEffect } from 'react'
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface AdvancedChartProps {
    symbol: string
    period: string
}

interface ChartDataPoint {
    time: string
    price: number
    sma20?: number
    sma50?: number
    sma200?: number
    ema12?: number
    ema26?: number
    rsi?: number
    macd?: number
    macdSignal?: number
    bbUpper?: number
    bbMiddle?: number
    bbLower?: number
}

export function AdvancedChart({ symbol, period }: AdvancedChartProps) {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [chartType, setChartType] = useState<'area' | 'line'>('area')

    // Indicator toggles
    const [showSMA20, setShowSMA20] = useState(false)
    const [showSMA50, setShowSMA50] = useState(false)
    const [showEMA12, setShowEMA12] = useState(false)
    const [showEMA26, setShowEMA26] = useState(false)
    const [showBB, setShowBB] = useState(false)
    const [showRSI, setShowRSI] = useState(false)

    useEffect(() => {
        loadChartData()
    }, [symbol, period])

    const loadChartData = async () => {
        try {
            setLoading(true)
            const response = await fetch(
                `/api/stocks/indicators?symbol=${symbol}&period=${period}`
            )
            const data = await response.json()

            if (data.chartData) {
                setChartData(data.chartData)
            }
        } catch (error) {
            console.error('Error loading chart data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <Skeleton className="h-[500px] w-full" />
    }

    return (
        <div className="space-y-4">
            {/* Chart Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Chart Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Chart Type</Label>
                            <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="area">Area</SelectItem>
                                    <SelectItem value="line">Line</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="sma20"
                                checked={showSMA20}
                                onCheckedChange={setShowSMA20}
                            />
                            <Label htmlFor="sma20" className="cursor-pointer">
                                SMA 20
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="sma50"
                                checked={showSMA50}
                                onCheckedChange={setShowSMA50}
                            />
                            <Label htmlFor="sma50" className="cursor-pointer">
                                SMA 50
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="ema12"
                                checked={showEMA12}
                                onCheckedChange={setShowEMA12}
                            />
                            <Label htmlFor="ema12" className="cursor-pointer">
                                EMA 12
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="ema26"
                                checked={showEMA26}
                                onCheckedChange={setShowEMA26}
                            />
                            <Label htmlFor="ema26" className="cursor-pointer">
                                EMA 26
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="bb" checked={showBB} onCheckedChange={setShowBB} />
                            <Label htmlFor="bb" className="cursor-pointer">
                                Bollinger Bands
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="rsi" checked={showRSI} onCheckedChange={setShowRSI} />
                            <Label htmlFor="rsi" className="cursor-pointer">
                                RSI
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Price Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Price Chart with Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' ? (
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" fontSize={12} />
                                    <YAxis
                                        fontSize={12}
                                        tickFormatter={(value) => `₹${value.toFixed(0)}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [`₹${value.toFixed(2)}`, '']}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorPrice)"
                                        name="Price"
                                    />
                                    {showSMA20 && (
                                        <Area
                                            type="monotone"
                                            dataKey="sma20"
                                            stroke="#ff7300"
                                            fill="none"
                                            strokeWidth={2}
                                            name="SMA 20"
                                            connectNulls
                                        />
                                    )}
                                    {showSMA50 && (
                                        <Area
                                            type="monotone"
                                            dataKey="sma50"
                                            stroke="#00C49F"
                                            fill="none"
                                            strokeWidth={2}
                                            name="SMA 50"
                                            connectNulls
                                        />
                                    )}
                                    {showEMA12 && (
                                        <Area
                                            type="monotone"
                                            dataKey="ema12"
                                            stroke="#FF8042"
                                            fill="none"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="EMA 12"
                                            connectNulls
                                        />
                                    )}
                                    {showEMA26 && (
                                        <Area
                                            type="monotone"
                                            dataKey="ema26"
                                            stroke="#FFBB28"
                                            fill="none"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="EMA 26"
                                            connectNulls
                                        />
                                    )}
                                    {showBB && (
                                        <>
                                            <Area
                                                type="monotone"
                                                dataKey="bbUpper"
                                                stroke="#82ca9d"
                                                fill="none"
                                                strokeWidth={1}
                                                strokeDasharray="3 3"
                                                name="BB Upper"
                                                connectNulls
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="bbMiddle"
                                                stroke="#8884d8"
                                                fill="none"
                                                strokeWidth={1}
                                                name="BB Middle"
                                                connectNulls
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="bbLower"
                                                stroke="#82ca9d"
                                                fill="none"
                                                strokeWidth={1}
                                                strokeDasharray="3 3"
                                                name="BB Lower"
                                                connectNulls
                                            />
                                        </>
                                    )}
                                </AreaChart>
                            ) : (
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" fontSize={12} />
                                    <YAxis
                                        fontSize={12}
                                        tickFormatter={(value) => `₹${value.toFixed(0)}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [`₹${value.toFixed(2)}`, '']}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Price"
                                    />
                                    {showSMA20 && (
                                        <Line
                                            type="monotone"
                                            dataKey="sma20"
                                            stroke="#ff7300"
                                            strokeWidth={2}
                                            dot={false}
                                            name="SMA 20"
                                            connectNulls
                                        />
                                    )}
                                    {showSMA50 && (
                                        <Line
                                            type="monotone"
                                            dataKey="sma50"
                                            stroke="#00C49F"
                                            strokeWidth={2}
                                            dot={false}
                                            name="SMA 50"
                                            connectNulls
                                        />
                                    )}
                                    {showEMA12 && (
                                        <Line
                                            type="monotone"
                                            dataKey="ema12"
                                            stroke="#FF8042"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="EMA 12"
                                            connectNulls
                                        />
                                    )}
                                    {showEMA26 && (
                                        <Line
                                            type="monotone"
                                            dataKey="ema26"
                                            stroke="#FFBB28"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="EMA 26"
                                            connectNulls
                                        />
                                    )}
                                    {showBB && (
                                        <>
                                            <Line
                                                type="monotone"
                                                dataKey="bbUpper"
                                                stroke="#82ca9d"
                                                strokeWidth={1}
                                                strokeDasharray="3 3"
                                                dot={false}
                                                name="BB Upper"
                                                connectNulls
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="bbMiddle"
                                                stroke="#8884d8"
                                                strokeWidth={1}
                                                dot={false}
                                                name="BB Middle"
                                                connectNulls
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="bbLower"
                                                stroke="#82ca9d"
                                                strokeWidth={1}
                                                strokeDasharray="3 3"
                                                dot={false}
                                                name="BB Lower"
                                                connectNulls
                                            />
                                        </>
                                    )}
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* RSI Chart */}
            {showRSI && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">RSI (Relative Strength Index)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" fontSize={12} />
                                    <YAxis domain={[0, 100]} fontSize={12} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="rsi"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={false}
                                        name="RSI"
                                        connectNulls
                                    />
                                    {/* Reference lines */}
                                    <Line
                                        type="monotone"
                                        dataKey={() => 70}
                                        stroke="#ff0000"
                                        strokeDasharray="5 5"
                                        strokeWidth={1}
                                        dot={false}
                                        name="Overbought (70)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={() => 30}
                                        stroke="#00ff00"
                                        strokeDasharray="5 5"
                                        strokeWidth={1}
                                        dot={false}
                                        name="Oversold (30)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
