'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    id: string
    telegramId: string
    phoneNumber: string
    name?: string
    email?: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (telegramId: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
    signup: (data: { telegramId: string; phoneNumber: string; password: string; name?: string }) => Promise<{ success: boolean; error?: string }>
    verify: (telegramId: string, code: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        refreshSession()
    }, [])

    const refreshSession = async () => {
        try {
            const res = await fetch('/api/auth/session')
            const data = await res.json()
            setUser(data.user)
        } catch (error) {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const signup = async (data: { telegramId: string; phoneNumber: string; password: string; name?: string }) => {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await res.json()
            if (!res.ok) {
                return { success: false, error: result.error }
            }
            return { success: true }
        } catch (error) {
            return { success: false, error: 'Signup failed' }
        }
    }

    const login = async (telegramId: string, password: string, rememberMe = false) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, password, rememberMe })
            })
            const result = await res.json()
            if (!res.ok) {
                return { success: false, error: result.error }
            }
            // Note: User will be set after verification, not here
            return { success: true }
        } catch (error) {
            return { success: false, error: 'Login failed' }
        }
    }

    const verify = async (telegramId: string, code: string) => {
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, code })
            })
            const result = await res.json()
            if (!res.ok) {
                return { success: false, error: result.error }
            }
            setUser(result.user)
            return { success: true }
        } catch (error) {
            return { success: false, error: 'Verification failed' }
        }
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/session', { method: 'DELETE' })
            setUser(null)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, verify, logout, refreshSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
