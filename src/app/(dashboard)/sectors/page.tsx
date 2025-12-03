'use client'

import { SectorDashboard } from '@/components/SectorDashboard'

export default function SectorsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Sector Analysis</h1>
                    <p className="text-muted-foreground mt-1">
                        Track performance across different market sectors
                    </p>
                </div>

                {/* Sector Dashboard Component */}
                <SectorDashboard />
            </div>
        </div>
    )
}
