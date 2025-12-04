import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationCode, sendVerificationCode } from '@/lib/telegram'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { telegramId, phoneNumber, password, name } = body

        // Validate required fields
        if (!telegramId || !phoneNumber || !password) {
            return NextResponse.json(
                { error: 'Telegram ID, phone number, and password are required' },
                { status: 400 }
            )
        }

        // Validate Telegram ID format (should be numeric)
        if (!/^\d+$/.test(telegramId)) {
            return NextResponse.json(
                { error: 'Invalid Telegram ID format' },
                { status: 400 }
            )
        }

        // Validate phone number (basic validation)
        if (!/^\d{10,15}$/.test(phoneNumber.replace(/[+\s-]/g, ''))) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { telegramId },
                    { phoneNumber: phoneNumber.replace(/[+\s-]/g, '') }
                ]
            }
        })

        if (existingUser) {
            if (existingUser.telegramId === telegramId) {
                return NextResponse.json(
                    { error: 'Telegram ID already registered' },
                    { status: 409 }
                )
            }
            return NextResponse.json(
                { error: 'Phone number already registered' },
                { status: 409 }
            )
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12)

        // Generate verification code
        const verifyCode = generateVerificationCode()
        const verifyExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Create user
        const user = await prisma.user.create({
            data: {
                telegramId,
                phoneNumber: phoneNumber.replace(/[+\s-]/g, ''),
                passwordHash,
                name: name || null,
                verifyCode,
                verifyExpiry,
                isVerified: false
            }
        })

        // Send verification code via Telegram
        const sent = await sendVerificationCode(telegramId, verifyCode)

        if (!sent) {
            // Delete the user if we couldn't send the code
            await prisma.user.delete({ where: { id: user.id } })
            return NextResponse.json(
                {
                    error: 'Could not send verification code. Please open Telegram and start a chat with the bot first (send /start), then try again.',
                    hint: 'You must message the bot on Telegram before it can send you codes.'
                },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your Telegram',
            telegramId,
            expiresIn: 300 // 5 minutes in seconds
        })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        )
    }
}
