import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const alertId = searchParams.get('id')

        if (!alertId) {
            return NextResponse.json(
                { error: 'Alert ID is required' },
                { status: 400 }
            )
        }

        // Delete the alert
        await prisma.alert.delete({
            where: {
                id: alertId,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Alert deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting alert:', error)
        return NextResponse.json(
            { error: 'Failed to delete alert' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { alertId, isActive } = body

        if (!alertId) {
            return NextResponse.json(
                { error: 'Alert ID is required' },
                { status: 400 }
            )
        }

        // Update the alert
        const updatedAlert = await prisma.alert.update({
            where: {
                id: alertId,
            },
            data: {
                isActive: isActive !== undefined ? isActive : undefined,
            },
        })

        return NextResponse.json({
            success: true,
            alert: updatedAlert,
            message: 'Alert updated successfully',
        })
    } catch (error) {
        console.error('Error updating alert:', error)
        return NextResponse.json(
            { error: 'Failed to update alert' },
            { status: 500 }
        )
    }
}
