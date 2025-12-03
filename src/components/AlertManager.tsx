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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Trash2, Check, X, TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

export function AlertManager() {
    const { toast } = useToast()
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('active')

    useEffect(() => {
        loadAlerts()
        // Refresh alerts every 30 seconds
        const interval = setInterval(loadAlerts, 30000)
        return () => clearInterval(interval)
    }, [filter])

    const loadAlerts = async () => {
        try {
            const response = await fetch(`/api/alert/list?status=${filter}`)
            const data = await response.json()
            setAlerts(data)
        } catch (error) {
            console.error('Error loading alerts:', error)
        } finally {
            setLoading(false)
        }
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
                loadAlerts()
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
                loadAlerts()
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update alert',
                variant: 'destructive',
            })
        }
    }

    const getAlertTypeLabel = (alertType: string) => {
        switch (alertType) {
            case 'PRICE_ABOVE':
                return 'Price Above'
            case 'PRICE_BELOW':
                return 'Price Below'
            case 'PERCENT_CHANGE_UP':
                return '% Increase'
            case 'PERCENT_CHANGE_DOWN':
                return '% Decrease'
            default:
                return alertType
        }
    }

    const getAlertIcon = (alertType: string) => {
        if (alertType.includes('UP') || alertType === 'PRICE_ABOVE') {
            return <TrendingUp className="w-4 h-4" />
        }
        return <TrendingDown className="w-4 h-4" />
    }

    const formatValue = (alertType: string, value: number) => {
        if (
            alertType === 'PERCENT_CHANGE_UP' ||
            alertType === 'PERCENT_CHANGE_DOWN'
        ) {
            return `${value.toFixed(2)}%`
        }
        return `₹${value.toFixed(2)}`
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Price Alerts
                        </CardTitle>
                        <CardDescription>Manage your stock price alerts</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'active' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('active')}
                        >
                            Active
                        </Button>
                        <Button
                            variant={filter === 'triggered' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('triggered')}
                        >
                            Triggered
                        </Button>
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No alerts found</p>
                        <p className="text-sm mt-1">
                            Create alerts from the stock details page
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`border rounded-lg p-4 ${alert.isTriggered
                                            ? 'bg-green-50 dark:bg-green-950/20'
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold">
                                                    {alert.symbol.replace('.NS', '')}
                                                </h4>
                                                <Badge variant="secondary" className="text-xs">
                                                    {alert.name}
                                                </Badge>
                                                {alert.isTriggered && (
                                                    <Badge className="bg-green-600">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Triggered
                                                    </Badge>
                                                )}
                                                {!alert.isActive && !alert.isTriggered && (
                                                    <Badge variant="outline">
                                                        <X className="w-3 h-3 mr-1" />
                                                        Paused
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {getAlertIcon(alert.alertType)}
                                                <span>{getAlertTypeLabel(alert.alertType)}:</span>
                                                <span className="font-medium text-foreground">
                                                    {formatValue(alert.alertType, alert.targetValue)}
                                                </span>
                                            </div>
                                            {alert.currentValue && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Current: ₹{alert.currentValue.toFixed(2)}
                                                </p>
                                            )}
                                            {alert.triggeredAt && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Triggered:{' '}
                                                    {new Date(alert.triggeredAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            {!alert.isTriggered && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleActive(alert.id, alert.isActive)}
                                                >
                                                    {alert.isActive ? (
                                                        <X className="w-4 h-4" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteAlert(alert.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
