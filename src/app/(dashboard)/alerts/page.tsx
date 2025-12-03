'use client'

import { AlertManager } from '@/components/AlertManager'

export default function AlertsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Price Alerts</h1>
                    <p className="text-muted-foreground mt-1">
                        Get notified when stocks reach your target prices
                    </p>
                </div>

                {/* Alert Manager Component */}
                <AlertManager />
            </div>
        </div>
    )
}
