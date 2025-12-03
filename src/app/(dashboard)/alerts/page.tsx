'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertStats } from '@/components/AlertStats'
import { AlertCard } from '@/components/AlertCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, Bell, RefreshCw } from 'lucide-react'

interface Alert {
    id: string
    symbol: string
    name: string
    alertType: string
    targetValue: number
    currentValue?: number
    isActive: boolean
    isTriggered: boolean
    triggeredAt?: string
    createdAt: string
}

export default function AlertsPage() {
    const { toast } = useToast()
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [activeTab, setActiveTab] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    // Quick create alert states
    const [showQuickCreate, setShowQuickCreate] = useState(false)
    const [quickSymbol, setQuickSymbol] = useState('')
    const [quickName, setQuickName] = useState('')
    const [quickType, setQuickType] = useState('PRICE_ABOVE')
    const [quickValue, setQuickValue] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadAlerts()
        const interval = setInterval(loadAlerts, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        filterAndSortAlerts()
    }, [alerts, searchQuery, sortBy, activeTab])

    const loadAlerts = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true)
            else setRefreshing(true)

            const response = await fetch('/api/alert/list?status=all')
            const data = await response.json()
            setAlerts(data)
        } catch (error) {
            console.error('Error loading alerts:', error)
            toast({
                title: 'Error',
                description: 'Failed to load alerts',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const filterAndSortAlerts = () => {
        let filtered = [...alerts]

        // Filter by tab
        if (activeTab === 'active') {
            filtered = filtered.filter((a) => a.isActive && !a.isTriggered)
        } else if (activeTab === 'triggered') {
            filtered = filtered.filter((a) => a.isTriggered)
        } else if (activeTab === 'paused') {
            filtered = filtered.filter((a) => !a.isActive && !a.isTriggered)
        }

        // Filter by search
        if (searchQuery) {
            filtered = filtered.filter(
                (a) =>
                    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'createdAt') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            } else if (sortBy === 'symbol') {
                return a.symbol.localeCompare(b.symbol)
            } else if (sortBy === 'targetValue') {
                return b.targetValue - a.targetValue
            }
            return 0
        })

        setFilteredAlerts(filtered)
    }

    const deleteAlert = async (alertId: string) => {
        try {
            const response = await fetch(`/api/alert/delete?id=${alertId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast({
                    title: '✓ Alert Deleted',
                    description: 'The alert has been removed',
                })
                loadAlerts(false)
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete alert',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred',
                variant: 'destructive',
            })
        }
    }

    const toggleActive = async (alertId: string, isActive: boolean) => {
        try {
            const response = await fetch('/api/alert/delete', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId, isActive: !isActive }),
            })

            if (response.ok) {
                toast({
                    title: isActive ? '✓ Alert Paused' : '✓ Alert Activated',
                    description: `Alert has been ${isActive ? 'paused' : 'activated'}`,
                })
                loadAlerts(false)
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update alert',
                variant: 'destructive',
            })
        }
    }

    const createQuickAlert = async () => {
        if (!quickSymbol || !quickValue || parseFloat(quickValue) <= 0) {
            toast({
                title: 'Invalid Input',
                description: 'Please fill in all fields with valid values',
                variant: 'destructive',
            })
            return
        }

        setCreating(true)

        try {
            const response = await fetch('/api/alert/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: quickSymbol.includes('.NS') ? quickSymbol : `${quickSymbol}.NS`,
                    name: quickName || quickSymbol,
                    alertType: quickType,
                    targetValue: parseFloat(quickValue),
                }),
            })

            if (response.ok) {
                toast({
                    title: '✓ Alert Created',
                    description: 'Your alert has been created successfully',
                })
                setQuickSymbol('')
                setQuickName('')
                setQuickValue('')
                setShowQuickCreate(false)
                loadAlerts(false)
            } else {
                const data = await response.json()
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to create alert',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while creating the alert',
                variant: 'destructive',
            })
        } finally {
            setCreating(false)
        }
    }

    // Calculate statistics
    const totalAlerts = alerts.length
    const activeAlerts = alerts.filter((a) => a.isActive && !a.isTriggered).length
    const triggeredAlerts = alerts.filter((a) => a.isTriggered).length
    const successRate = totalAlerts > 0 ? Math.round((triggeredAlerts / totalAlerts) * 100) : 0

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Page Header */}
                <div className="gradient-purple-subtle rounded-2xl p-8 md:p-12">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gradient mb-2">
                                Price Alerts
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Get notified when stocks reach your target prices
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => loadAlerts(false)}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                                size="lg"
                                className="gradient-purple"
                                onClick={() => setShowQuickCreate(!showQuickCreate)}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Alert
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <AlertStats
                    totalAlerts={totalAlerts}
                    activeAlerts={activeAlerts}
                    triggeredAlerts={triggeredAlerts}
                    successRate={successRate}
                />

                {/* Quick Create Alert */}
                {showQuickCreate && (
                    <Card className="border-purple-500/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Create New Alert
                            </CardTitle>
                            <CardDescription>
                                Set up a price alert for any NSE stock
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="symbol">Stock Symbol</Label>
                                    <Input
                                        id="symbol"
                                        placeholder="e.g., RELIANCE"
                                        value={quickSymbol}
                                        onChange={(e) => setQuickSymbol(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Company Name (Optional)</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Reliance Industries"
                                        value={quickName}
                                        onChange={(e) => setQuickName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alertType">Alert Type</Label>
                                    <Select value={quickType} onValueChange={setQuickType}>
                                        <SelectTrigger id="alertType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PRICE_ABOVE">Price Above</SelectItem>
                                            <SelectItem value="PRICE_BELOW">Price Below</SelectItem>
                                            <SelectItem value="PERCENT_CHANGE_UP">% Increase</SelectItem>
                                            <SelectItem value="PERCENT_CHANGE_DOWN">% Decrease</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="targetValue">Target Value</Label>
                                    <Input
                                        id="targetValue"
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter value"
                                        value={quickValue}
                                        onChange={(e) => setQuickValue(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button
                                        onClick={createQuickAlert}
                                        disabled={creating}
                                        className="flex-1"
                                    >
                                        {creating ? 'Creating...' : 'Create'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQuickCreate(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search alerts by stock symbol or name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Created Date</SelectItem>
                                        <SelectItem value="symbol">Stock Symbol</SelectItem>
                                        <SelectItem value="targetValue">Target Value</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts List */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">
                            All ({totalAlerts})
                        </TabsTrigger>
                        <TabsTrigger value="active">
                            Active ({activeAlerts})
                        </TabsTrigger>
                        <TabsTrigger value="triggered">
                            Triggered ({triggeredAlerts})
                        </TabsTrigger>
                        <TabsTrigger value="paused">
                            Paused ({totalAlerts - activeAlerts - triggeredAlerts})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-48 w-full" />
                                ))}
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="text-center text-muted-foreground">
                                        <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                                        <p className="text-sm">
                                            {searchQuery
                                                ? 'Try a different search query'
                                                : 'Create your first alert to get started'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredAlerts.map((alert) => (
                                    <AlertCard
                                        key={alert.id}
                                        {...alert}
                                        onDelete={deleteAlert}
                                        onToggle={toggleActive}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
