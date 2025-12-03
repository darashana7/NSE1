'use client'

import { useLiveStockPrices } from '@/hooks/useLiveStockPrices'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LiveStockTickerProps {
    symbols: string[]
}

export function LiveStockTicker({ symbols }: LiveStockTickerProps) {
    const { prices, isConnected, error, reconnect } = useLiveStockPrices(symbols)

    if (symbols.length === 0) {
        return null
    }

    return (
        <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Live Market Prices</h3>
                    {isConnected ? (
                        <Badge variant="default" className="bg-green-500 gap-1">
                            <Wifi className="h-3 w-3" />
                            Live
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="gap-1">
                            <WifiOff className="h-3 w-3" />
                            {error || 'Disconnected'}
                        </Badge>
                    )}
                </div>
                {!isConnected && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={reconnect}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reconnect
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {symbols.map((symbol) => {
                    const stock = prices.get(symbol)

                    if (!stock) {
                        return (
                            <div
                                key={symbol}
                                className="p-4 border rounded-lg bg-muted/30 animate-pulse"
                            >
                                <div className="h-4 bg-muted rounded w-24 mb-2" />
                                <div className="h-6 bg-muted rounded w-32 mb-1" />
                                <div className="h-4 bg-muted rounded w-20" />
                            </div>
                        )
                    }

                    const isPositive = stock.change >= 0
                    const marketStatusText = (stock as any).marketStatus === 'OPEN' ? 'Live'
                        : (stock as any).marketStatus === 'PRE' ? 'Pre-Market'
                            : (stock as any).marketStatus === 'POST' ? 'After Hours'
                                : 'Closed'
                    const changeLabel = (stock as any).marketStatus === 'OPEN' ? "Today's Change" : "Day's Change"

                    return (
                        <div
                            key={symbol}
                            className={`p-4 border rounded-lg transition-all duration-300 ${isConnected ? 'ring-2 ring-blue-500/20' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm text-muted-foreground">
                                        {symbol.replace('.NS', '')}
                                    </span>
                                    <Badge
                                        variant={(stock as any).marketStatus === 'OPEN' ? 'default' : 'secondary'}
                                        className={`text-xs w-fit ${(stock as any).marketStatus === 'OPEN' ? 'bg-green-500' : 'bg-gray-500'
                                            }`}
                                    >
                                        {marketStatusText}
                                    </Badge>
                                </div>
                                {isPositive ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="text-2xl font-bold">
                                    ₹{stock.price.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">{changeLabel}</span>
                                    <span
                                        className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        {isPositive ? '+' : ''}
                                        {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                                        {stock.changePercent.toFixed(2)}%)
                                    </span>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    Vol: {stock.volume}
                                </div>
                            </div>

                            {isConnected && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                                    Updated {new Date(stock.timestamp).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
