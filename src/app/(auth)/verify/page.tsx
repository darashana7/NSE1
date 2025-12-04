'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Loader2, RefreshCw, Check } from 'lucide-react'

function VerifyContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { verify } = useAuth()

    const telegramId = searchParams.get('telegramId') || ''
    const type = searchParams.get('type') || 'login'

    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState('')
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [countdown, setCountdown] = useState(300) // 5 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0]
        if (!/^\d*$/.test(value)) return

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`)
            nextInput?.focus()
        }

        // Auto-submit when all digits entered
        if (newCode.every(d => d) && newCode.join('').length === 6) {
            handleVerify(newCode.join(''))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handleVerify = async (codeString?: string) => {
        setError('')
        setIsLoading(true)

        const verifyCode = codeString || code.join('')
        const result = await verify(telegramId, verifyCode)

        if (result.success) {
            // Force a hard navigation to ensure cookies are properly read
            window.location.href = '/'
        } else {
            setError(result.error || 'Verification failed')
            setCode(['', '', '', '', '', ''])
            document.getElementById('code-0')?.focus()
        }

        setIsLoading(false)
    }

    const handleResend = async () => {
        setIsResending(true)
        setError('')

        try {
            const endpoint = type === 'signup' ? '/api/auth/signup' : '/api/auth/login'
            // For resend, we need to re-trigger the same flow
            // This is a simplified version - in production, create a dedicated resend endpoint
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, password: 'resend_request' })
            })

            if (res.ok) {
                setCountdown(300)
                setCode(['', '', '', '', '', ''])
            }
        } catch (error) {
            setError('Failed to resend code')
        }

        setIsResending(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <Card className="w-full max-w-md bg-slate-900/80 border-purple-500/30 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Verify Your Account</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter the 6-digit code sent to your Telegram
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-center gap-2">
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        {countdown > 0 ? (
                            <p className="text-slate-400">
                                Code expires in{' '}
                                <span className="text-purple-400 font-mono">{formatTime(countdown)}</span>
                            </p>
                        ) : (
                            <p className="text-red-400">Code expired</p>
                        )}
                    </div>

                    <Button
                        onClick={() => handleVerify()}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        disabled={isLoading || code.some(d => !d)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Verify
                            </>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleResend}
                        className="w-full text-slate-400 hover:text-white"
                        disabled={isResending || countdown > 240} // Allow resend after 1 min
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Resend Code
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    )
}
