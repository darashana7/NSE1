'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check localStorage for saved theme preference
        const savedTheme = localStorage.getItem('theme') as Theme | null
        // Check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
        setTheme(initialTheme)

        // Apply theme to document
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const setDarkTheme = () => {
        setTheme('dark')
        localStorage.setItem('theme', 'dark')
        document.documentElement.classList.add('dark')
    }

    const setLightTheme = () => {
        setTheme('light')
        localStorage.setItem('theme', 'light')
        document.documentElement.classList.remove('dark')
    }

    return {
        theme,
        toggleTheme,
        setDarkTheme,
        setLightTheme,
        mounted, // Use this to prevent hydration mismatch
    }
}
