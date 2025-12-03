import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { symbol, name, alertType, targetValue, userId } = body

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

        // Create the alert
        const alert = await prisma.alert.create({
            data: {
                symbol,
                name,
                alertType,
                targetValue: parseFloat(targetValue),
                userId: userId || null,
                isActive: true,
                isTriggered: false,
            },
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
