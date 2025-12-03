'use client'

import { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface SectorPerformance {
    id: string
    name: string
    description: string
    totalStocks: number
    avgChangePercent: number
    gainers: number
    losers: number
    topGainers: Array<{
        symbol: string
        name: string
        changePercent: number
    }>
    topLosers: Array<{
        symbol: string
        name: string
        changePercent: number
    }>
}

export function SectorDashboard() {
    const [sectors, setSectors] = useState<SectorPerformance[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSectorPerformance()
        // Refresh every minute
        const interval = setInterval(loadSectorPerformance, 60000)
        return () => clearInterval(interval)
    }, [])

    const loadSectorPerformance = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/sectors/performance')
            const data = await response.json()
            if (data.sectors) {
                setSectors(data.sectors)
            }
        } catch (error) {
            console.error('Error loading sector performance:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPerformanceColor = (changePercent: number) => {
        if (changePercent > 2) return 'bg-green-600 text-white'
        if (changePercent > 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
        if (changePercent > -2) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        return 'bg-red-600 text-white'
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        Sector Performance Overview
                    </CardTitle>
                    <CardDescription>
                        Real-time performance metrics across all sectors
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sectors.map((sector) => (
                            <div
                                key={sector.id}
                                className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                                <div className="font-semibold text-sm mb-1">{sector.name}</div>
                                <Badge className={getPerformanceColor(sector.avgChangePercent)}>
                                    {sector.avgChangePercent >= 0 ? '+' : ''}
                                    {sector.avgChangePercent.toFixed(2)}%
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-2">
                                    {sector.gainers}↑ {sector.losers}↓
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectors.map((sector) => (
                    <Card key={sector.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{sector.name}</CardTitle>
                            <CardDescription>{sector.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Avg Change
                                    </span>
                                    <Badge
                                        className={getPerformanceColor(sector.avgChangePercent)}
                                    >
                                        {sector.avgChangePercent >= 0 && '+'}
                                        {sector.avgChangePercent.toFixed(2)}%
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total Stocks</p>
                                        <p className="font-semibold">{sector.totalStocks}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Gainers / Losers</p>
                                        <p className="font-semibold">
                                            <span className="text-green-600">{sector.gainers}</span> /{' '}
                                            <span className="text-red-600">{sector.losers}</span>
                                        </p>
                                    </div>
                                </div>

                                {sector.topGainers && sector.topGainers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            Top Gainers
                                        </h4>
                                        <div className="space-y-1">
                                            {sector.topGainers.slice(0, 3).map((stock) => (
                                                <div
                                                    key={stock.symbol}
                                                    className="flex items-center justify-between text-xs"
                                                >
                                                    <span className="font-medium">
                                                        {stock.symbol.replace('.NS', '')}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-green-600 border-green-600"
                                                    >
                                                        +{stock.changePercent.toFixed(2)}%
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sector.topLosers && sector.topLosers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                            Top Losers
                                        </h4>
                                        <div className="space-y-1">
                                            {sector.topLosers.slice(0, 3).map((stock) => (
                                                <div
                                                    key={stock.symbol}
                                                    className="flex items-center justify-between text-xs"
                                                >
                                                    <span className="font-medium">
                                                        {stock.symbol.replace('.NS', '')}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-red-600 border-red-600"
                                                    >
                                                        {stock.changePercent.toFixed(2)}%
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
