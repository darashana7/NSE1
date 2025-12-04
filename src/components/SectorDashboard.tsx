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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
    const { toast } = useToast()
    const [sectors, setSectors] = useState<SectorPerformance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedSector, setSelectedSector] = useState<string | null>(null)

    useEffect(() => {
        loadSectorPerformance()
        // Refresh every 2 minutes
        const interval = setInterval(loadSectorPerformance, 120000)
        return () => clearInterval(interval)
    }, [])

    const loadSectorPerformance = async (showToast = false) => {
        try {
            if (!loading) setRefreshing(true)
            setError(null)

            const response = await fetch('/api/sectors/performance')

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`)
            }

            const data = await response.json()

            if (data.sectors) {
                setSectors(data.sectors)
                if (showToast) {
                    toast({
                        title: '✓ Refreshed',
                        description: `Updated ${data.sectors.length} sectors`,
                        duration: 2000,
                    })
                }
            } else if (data.error) {
                setError(data.error)
            }
        } catch (error) {
            console.error('Error loading sector performance:', error)
            setError('Failed to load sector data. Please try again.')
            if (showToast) {
                toast({
                    title: '✗ Error',
                    description: 'Failed to refresh sector data',
                    variant: 'destructive',
                    duration: 3000,
                })
            }
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const getPerformanceColor = (changePercent: number) => {
        if (changePercent > 2) return 'bg-green-600 text-white'
        if (changePercent > 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
        if (changePercent > -2) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        return 'bg-red-600 text-white'
    }

    const getPerformanceGradient = (changePercent: number) => {
        if (changePercent > 0) {
            return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))'
        }
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="py-12">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Sectors</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => loadSectorPerformance(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Sector Overview Header */}
            <Card className="gradient-purple-subtle">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-purple-600" />
                            <div>
                                <CardTitle className="text-2xl">Sector Performance Overview</CardTitle>
                                <CardDescription>
                                    Real-time performance metrics across {sectors.length} sectors
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => loadSectorPerformance(true)}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {sectors.map((sector) => (
                            <div
                                key={sector.id}
                                onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
                                className={`text-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${selectedSector === sector.id
                                        ? 'ring-2 ring-purple-500 shadow-lg'
                                        : 'hover:shadow-md'
                                    }`}
                                style={{ background: getPerformanceGradient(sector.avgChangePercent) }}
                            >
                                <div className="font-semibold text-sm mb-2 line-clamp-2">{sector.name}</div>
                                <Badge className={getPerformanceColor(sector.avgChangePercent)}>
                                    {sector.avgChangePercent >= 0 ? '+' : ''}
                                    {sector.avgChangePercent.toFixed(2)}%
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-2">
                                    <span className="text-green-600">{sector.gainers}↑</span>
                                    {' '}
                                    <span className="text-red-600">{sector.losers}↓</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Sector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectors
                    .filter((sector) => !selectedSector || sector.id === selectedSector)
                    .map((sector) => (
                        <Card key={sector.id} className="card-hover overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{sector.name}</CardTitle>
                                    <Badge className={getPerformanceColor(sector.avgChangePercent)}>
                                        {sector.avgChangePercent >= 0 && '+'}
                                        {sector.avgChangePercent.toFixed(2)}%
                                    </Badge>
                                </div>
                                <CardDescription>{sector.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-muted/50 rounded-lg">
                                            <p className="text-lg font-bold">{sector.totalStocks}</p>
                                            <p className="text-xs text-muted-foreground">Stocks</p>
                                        </div>
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <p className="text-lg font-bold text-green-600">{sector.gainers}</p>
                                            <p className="text-xs text-muted-foreground">Gainers</p>
                                        </div>
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <p className="text-lg font-bold text-red-600">{sector.losers}</p>
                                            <p className="text-xs text-muted-foreground">Losers</p>
                                        </div>
                                    </div>

                                    {/* Top Gainers */}
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
                                                        className="flex items-center justify-between text-xs p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
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

                                    {/* Top Losers */}
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
                                                        className="flex items-center justify-between text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
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

                                    {/* Empty state */}
                                    {(!sector.topGainers || sector.topGainers.length === 0) &&
                                        (!sector.topLosers || sector.topLosers.length === 0) && (
                                            <div className="text-center py-4 text-muted-foreground text-sm">
                                                No stock data available for this sector
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
