'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Send, User, Phone, Lock, Loader2 } from 'lucide-react'

export default function SignupPage() {
    const router = useRouter()
    const { signup } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        telegramId: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        name: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)

        const result = await signup({
            telegramId: formData.telegramId,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            name: formData.name || undefined
        })

        if (result.success) {
            router.push(`/verify?telegramId=${formData.telegramId}&type=signup`)
        } else {
            setError(result.error || 'Signup failed')
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
                    <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign up with your Telegram ID for secure verification
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
                                    placeholder="e.g., 718039423"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={formData.telegramId}
                                    onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500">Find your ID using @userinfobot on Telegram</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="e.g., 9008458762"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Name (Optional)</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your name"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    placeholder="Min. 6 characters"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
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
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Sign Up
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <p className="text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
