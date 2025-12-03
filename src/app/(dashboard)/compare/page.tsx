'use client'

import { StockComparison } from '@/components/StockComparison'

export default function ComparePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Compare Stocks</h1>
                    <p className="text-muted-foreground mt-1">
                        Analyze multiple stocks side-by-side
                    </p>
                </div>

                {/* Stock Comparison Component */}
                <StockComparison />
            </div>
        </div>
    )
}
