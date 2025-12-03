'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    TrendingUp,
    TrendingDown,
    Trash2,
    Pause,
    Play,
    CheckCircle2,
} from 'lucide-react'

interface AlertCardProps {
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
    onDelete: (id: string) => void
    onToggle: (id: string, isActive: boolean) => void
}

export function AlertCard({
    id,
    symbol,
    name,
    alertType,
    targetValue,
    currentValue,
    isActive,
    isTriggered,
    triggeredAt,
    onDelete,
    onToggle,
}: AlertCardProps) {
    const getAlertTypeLabel = (type: string) => {
        switch (type) {
            case 'PRICE_ABOVE':
                return 'Price Above'
            case 'PRICE_BELOW':
                return 'Price Below'
            case 'PERCENT_CHANGE_UP':
                return '% Increase'
            case 'PERCENT_CHANGE_DOWN':
                return '% Decrease'
            default:
                return type
        }
    }

    const getAlertIcon = (type: string) => {
        if (type.includes('UP') || type === 'PRICE_ABOVE') {
            return <TrendingUp className="w-4 h-4" />
        }
        return <TrendingDown className="w-4 h-4" />
    }

    const formatValue = (type: string, value: number) => {
        if (type === 'PERCENT_CHANGE_UP' || type === 'PERCENT_CHANGE_DOWN') {
            return `${value.toFixed(2)}%`
        }
        return `₹${value.toFixed(2)}`
    }

    const calculateProgress = () => {
        if (!currentValue) return 0

        if (alertType === 'PRICE_ABOVE') {
            const progress = (currentValue / targetValue) * 100
            return Math.min(progress, 100)
        } else if (alertType === 'PRICE_BELOW') {
            const progress = ((targetValue / currentValue) * 100)
            return Math.min(progress, 100)
        }
        return 50
    }

    const getDistanceToTarget = () => {
        if (!currentValue) return null

        if (alertType === 'PRICE_ABOVE' || alertType === 'PRICE_BELOW') {
            const diff = Math.abs(currentValue - targetValue)
            const percent = ((diff / currentValue) * 100).toFixed(2)
            return `${percent}% away`
        }
        return null
    }

    const cardClassName = isTriggered
        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
        : isActive
            ? 'border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20'
            : 'border-muted bg-muted/20'

    return (
        <Card className={`card-hover ${cardClassName} transition-all duration-300`}>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">
                                    {symbol.replace('.NS', '')}
                                </h3>
                                {isTriggered && (
                                    <Badge className="bg-green-600">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Triggered
                                    </Badge>
                                )}
                                {!isActive && !isTriggered && (
                                    <Badge variant="outline" className="text-muted-foreground">
                                        <Pause className="w-3 h-3 mr-1" />
                                        Paused
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{name}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            {!isTriggered && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onToggle(id, isActive)}
                                    title={isActive ? 'Pause alert' : 'Activate alert'}
                                >
                                    {isActive ? (
                                        <Pause className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(id)}
                                title="Delete alert"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    </div>

                    {/* Alert Details */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {getAlertIcon(alertType)}
                                <span>{getAlertTypeLabel(alertType)}</span>
                            </div>
                            <span className="font-semibold text-foreground">
                                {formatValue(alertType, targetValue)}
                            </span>
                        </div>

                        {currentValue && (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Current Price</span>
                                    <span className="font-medium">₹{currentValue.toFixed(2)}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1">
                                    <Progress value={calculateProgress()} className="h-2" />
                                    {getDistanceToTarget() && (
                                        <p className="text-xs text-muted-foreground text-right">
                                            {getDistanceToTarget()}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {triggeredAt && (
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                                Triggered on {new Date(triggeredAt).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
