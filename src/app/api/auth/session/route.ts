import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface JWTPayload {
    userId: string
    telegramId: string
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ user: null })
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                telegramId: true,
                phoneNumber: true,
                name: true,
                email: true,
                isVerified: true,
                lastLogin: true,
                createdAt: true
            }
        })

        if (!user) {
            return NextResponse.json({ user: null })
        }

        return NextResponse.json({ user })

    } catch (error) {
        // Token invalid or expired
        return NextResponse.json({ user: null })
    }
}

export async function DELETE(request: NextRequest) {
    // Logout - clear cookie
    const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully'
    })

    response.cookies.delete('auth-token')

    return response
}
