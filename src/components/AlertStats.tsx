'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellRing, CheckCircle2, TrendingUp } from 'lucide-react'

interface AlertStatsProps {
    totalAlerts: number
    activeAlerts: number
    triggeredAlerts: number
    successRate: number
}

export function AlertStats({ totalAlerts, activeAlerts, triggeredAlerts, successRate }: AlertStatsProps) {
    const stats = [
        {
            title: 'Total Alerts',
            value: totalAlerts,
            icon: Bell,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-950/30',
        },
        {
            title: 'Active Alerts',
            value: activeAlerts,
            icon: BellRing,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-950/30',
        },
        {
            title: 'Triggered',
            value: triggeredAlerts,
            icon: CheckCircle2,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-950/30',
        },
        {
            title: 'Success Rate',
            value: `${successRate}%`,
            icon: TrendingUp,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-950/30',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card key={index} className="card-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
