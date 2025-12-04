import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationCode, sendVerificationCode } from '@/lib/telegram'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { telegramId, password, rememberMe } = body

        // Validate required fields
        if (!telegramId || !password) {
            return NextResponse.json(
                { error: 'Telegram ID and password are required' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { telegramId }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Generate verification code
        const verifyCode = generateVerificationCode()
        const verifyExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Update user with new verification code and remember me preference
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verifyCode,
                verifyExpiry,
                rememberMe: rememberMe || false
            }
        })

        // Send verification code via Telegram
        const sent = await sendVerificationCode(telegramId, verifyCode)

        if (!sent) {
            return NextResponse.json(
                { error: 'Failed to send verification code' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your Telegram',
            telegramId,
            expiresIn: 300
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}
