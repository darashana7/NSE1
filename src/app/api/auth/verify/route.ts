import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { sendWelcomeMessage, sendLoginNotification } from '@/lib/telegram'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { telegramId, code } = body

        // Validate required fields
        if (!telegramId || !code) {
            return NextResponse.json(
                { error: 'Telegram ID and verification code are required' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { telegramId }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Check if code is valid
        if (user.verifyCode !== code) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 401 }
            )
        }

        // Check if code is expired
        if (!user.verifyExpiry || new Date() > user.verifyExpiry) {
            return NextResponse.json(
                { error: 'Verification code expired' },
                { status: 401 }
            )
        }

        const isFirstLogin = !user.isVerified

        // Update user - mark as verified, clear code, update last login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verifyCode: null,
                verifyExpiry: null,
                lastLogin: new Date()
            }
        })

        // Generate JWT token
        const tokenExpiry = user.rememberMe ? '30d' : '24h'
        const token = jwt.sign(
            {
                userId: user.id,
                telegramId: user.telegramId
            },
            JWT_SECRET,
            { expiresIn: tokenExpiry }
        )

        // Send notification via Telegram
        if (isFirstLogin) {
            await sendWelcomeMessage(telegramId, user.name || undefined)
        } else {
            const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'Unknown'
            await sendLoginNotification(telegramId, ip)
        }

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                telegramId: user.telegramId,
                phoneNumber: user.phoneNumber,
                name: user.name,
                email: user.email
            }
        })

        // Set HTTP-only cookie with token
        const maxAge = user.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
            path: '/'
        })

        return response

    } catch (error) {
        console.error('Verify error:', error)
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        )
    }
}
