'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Send, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        telegramId: '',
        password: '',
        rememberMe: false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const result = await login(formData.telegramId, formData.password, formData.rememberMe)

        if (result.success) {
            router.push(`/verify?telegramId=${formData.telegramId}&type=login`)
        } else {
            setError(result.error || 'Login failed')
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <Card className="w-full max-w-md bg-slate-900/80 border-purple-500/30 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                        <Send className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign in to your NSE Stock Dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="telegramId" className="text-slate-300">Telegram ID</Label>
                            <div className="relative">
                                <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="telegramId"
                                    type="text"
                                    placeholder="Enter your Telegram ID"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={formData.telegramId}
                                    onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rememberMe"
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, rememberMe: checked as boolean })
                                    }
                                    className="border-slate-600 data-[state=checked]:bg-purple-500"
                                />
                                <Label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer">
                                    Remember me for 30 days
                                </Label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <p className="text-center text-sm text-slate-400">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                                Sign Up
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
