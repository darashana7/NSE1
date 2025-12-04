import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to fetch current stock price
async function getCurrentPrice(symbol: string): Promise<number | null> {
    try {
        const response = await fetch(
            `http://localhost:3000/api/stocks/details?symbol=${symbol}&period=1d`
        )
        const data = await response.json()
        return data.stock?.price || null
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error)
        return null
    }
}

// Check if an alert should be triggered
function shouldTrigger(
    alertType: string,
    currentPrice: number,
    targetValue: number,
    previousPrice?: number
): boolean {
    switch (alertType) {
        case 'PRICE_ABOVE':
            return currentPrice >= targetValue
        case 'PRICE_BELOW':
            return currentPrice <= targetValue
        case 'PERCENT_CHANGE_UP':
            if (!previousPrice) return false
            const percentUp = ((currentPrice - previousPrice) / previousPrice) * 100
            return percentUp >= targetValue
        case 'PERCENT_CHANGE_DOWN':
            if (!previousPrice) return false
            const percentDown =
                ((previousPrice - currentPrice) / previousPrice) * 100
            return percentDown >= targetValue
        default:
            return false
    }
}

export async function GET(request: NextRequest) {
    try {
        // Fetch all active alerts
        const activeAlerts = await prisma.alert.findMany({
            where: {
                isActive: true,
                isTriggered: false,
            },
        })

        const triggeredAlerts: any[] = []

        // Check each alert
        for (const alert of activeAlerts) {
            const currentPrice = await getCurrentPrice(alert.symbol)

            if (!currentPrice) continue

            const shouldTriggerAlert = shouldTrigger(
                alert.alertType,
                currentPrice,
                alert.targetValue,
                alert.currentValue || undefined
            )

            if (shouldTriggerAlert) {
                // Update alert as triggered
                const updatedAlert = await prisma.alert.update({
                    where: { id: alert.id },
                    data: {
                        isTriggered: true,
                        triggeredAt: new Date(),
                        currentValue: currentPrice,
                    },
                })

                triggeredAlerts.push(updatedAlert)
            } else {
                // Update current value for percentage change alerts
                await prisma.alert.update({
                    where: { id: alert.id },
                    data: {
                        currentValue: currentPrice,
                    },
                })
            }
        }

        return NextResponse.json({
            success: true,
            checkedAlerts: activeAlerts.length,
            triggeredAlerts,
            message: `Checked ${activeAlerts.length} alerts, ${triggeredAlerts.length} triggered`,
        })
    } catch (error) {
        console.error('Error checking alerts:', error)
        return NextResponse.json(
            { error: 'Failed to check alerts' },
            { status: 500 }
        )
    }
}
