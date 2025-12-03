'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme()

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <button
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent"
                aria-label="Toggle theme"
            >
                <div className="h-5 w-5" />
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all duration-300 hover:bg-accent hover:border-primary/20 hover:shadow-md"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative h-5 w-5">
                {/* Sun icon */}
                <Sun
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${theme === 'light'
                            ? 'rotate-0 scale-100 opacity-100'
                            : 'rotate-90 scale-0 opacity-0'
                        }`}
                />
                {/* Moon icon */}
                <Moon
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${theme === 'dark'
                            ? 'rotate-0 scale-100 opacity-100'
                            : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>
        </button>
    )
}
