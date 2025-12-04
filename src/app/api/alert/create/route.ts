import { NextRequest, NextResponse } from 'next/server'
import { createAlert, Alert } from '@/lib/alertsStore'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { symbol, name, alertType, targetValue } = body

        // Validate input
        if (!symbol || !name || !alertType || targetValue === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate alert type
        const validAlertTypes = [
            'PRICE_ABOVE',
            'PRICE_BELOW',
            'PERCENT_CHANGE_UP',
            'PERCENT_CHANGE_DOWN',
        ]
        if (!validAlertTypes.includes(alertType)) {
            return NextResponse.json(
                { error: 'Invalid alert type' },
                { status: 400 }
            )
        }

        // Validate target value
        const parsedValue = parseFloat(targetValue)
        if (isNaN(parsedValue) || parsedValue <= 0) {
            return NextResponse.json(
                { error: 'Target value must be a positive number' },
                { status: 400 }
            )
        }

        // Create the alert using in-memory store
        const alert = createAlert({
            symbol,
            name,
            alertType: alertType as Alert['alertType'],
            targetValue: parsedValue,
        })

        return NextResponse.json({
            success: true,
            alert,
            message: 'Alert created successfully',
        })
    } catch (error) {
        console.error('Error creating alert:', error)
        return NextResponse.json(
            { error: 'Failed to create alert' },
            { status: 500 }
        )
    }
}
