import { NextRequest, NextResponse } from 'next/server'
import { getAlerts, updateAlert, Alert } from '@/lib/alertsStore'

// Helper function to fetch current stock price directly from Yahoo Finance
async function getCurrentPrice(symbol: string): Promise<number | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        if (response.ok) {
            const data = await response.json()
            const result = data.chart?.result?.[0]
            if (result?.meta?.regularMarketPrice) {
                return result.meta.regularMarketPrice
            }
        }
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error)
    }
    return null
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
        // Fetch all active alerts from in-memory store
        const activeAlerts = getAlerts('active')

        const triggeredAlerts: Alert[] = []

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
                const updatedAlert = updateAlert(alert.id, {
                    isTriggered: true,
                    triggeredAt: new Date().toISOString(),
                    currentValue: currentPrice,
                })

                if (updatedAlert) {
                    triggeredAlerts.push(updatedAlert)
                }
            } else {
                // Update current value for percentage change alerts
                updateAlert(alert.id, {
                    currentValue: currentPrice,
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
