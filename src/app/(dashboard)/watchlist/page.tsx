'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Trash2, RefreshCw, Bell, GitCompare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface WatchlistItem {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
}

export default function WatchlistPage() {
    const { toast } = useToast()
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadWatchlist()

        const interval = setInterval(() => {
            loadWatchlist()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const loadWatchlist = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/watchlist')
            const data = await response.json()
            setWatchlist(data)
        } catch (error) {
            console.error('Error loading watchlist:', error)
            toast({
                title: '✗ Error',
                description: 'Failed to load watchlist',
                variant: 'destructive',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    const removeFromWatchlist = async (symbol: string, name: string) => {
        try {
            const response = await fetch('/api/watchlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, name })
            })

            if (response.ok) {
                loadWatchlist()
                toast({
                    title: '✓ Removed from Watchlist',
                    description: `${name} has been removed from your watchlist.`,
                    duration: 3000,
                })
            }
        } catch (error) {
            console.error('Error removing from watchlist:', error)
            toast({
                title: '✗ Error',
                description: 'Failed to remove from watchlist',
                variant: 'destructive',
                duration: 3000,
            })
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
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">My Watchlist</h1>
                        <p className="text-muted-foreground mt-1">
                            Track your favorite stocks in one place
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadWatchlist}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Watchlist Stats */}
                {watchlist.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{watchlist.length}</div>
                                <p className="text-sm text-muted-foreground">Total Stocks</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {watchlist.filter(s => s.changePercent >= 0).length}
                                </div>
                                <p className="text-sm text-muted-foreground">Gainers</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {watchlist.filter(s => s.changePercent < 0).length}
                                </div>
                                <p className="text-sm text-muted-foreground">Losers</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Watchlist Items */}
                <Card className="card-hover">
                    <CardHeader>
                        <CardTitle>Tracked Stocks</CardTitle>
                        <CardDescription>Real-time updates on your favorite stocks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && watchlist.length === 0 ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : watchlist.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">
                                    No stocks in your watchlist yet.
                                </p>
                                <Link href="/">
                                    <Button className="gradient-purple">
                                        Browse Stocks
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {watchlist.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                                                <Badge variant="secondary">{stock.name}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-xl font-bold">{formatNumber(stock.price)}</p>
                                                {formatChange(stock.change, stock.changePercent)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href="/alerts">
                                                <Button variant="outline" size="sm">
                                                    <Bell className="w-4 h-4 mr-1" />
                                                    Alert
                                                </Button>
                                            </Link>
                                            <Link href="/compare">
                                                <Button variant="outline" size="sm">
                                                    <GitCompare className="w-4 h-4 mr-1" />
                                                    Compare
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFromWatchlist(stock.symbol, stock.name)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
