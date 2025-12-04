'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Star, Bell, BarChart3, GitCompare, Menu, X, Activity, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/watchlist', label: 'Watchlist', icon: Star },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/sectors', label: 'Sectors', icon: BarChart3 },
    { href: '/compare', label: 'Compare', icon: GitCompare },
]

export function Navigation() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout, isLoading } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.push('/login')
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="gradient-purple rounded-lg p-2">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient hidden sm:inline">
                            NSE Live
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs">Live</span>
                        </Badge>
                        <ThemeToggle />

                        {/* User Menu */}
                        {!isLoading && user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user.name || 'User'}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                @{user.telegramId}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 border-t">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        className="w-full justify-start"
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                        {!isLoading && user && (
                            <>
                                <div className="border-t pt-2 mt-2">
                                    <div className="px-4 py-2 text-sm text-muted-foreground">
                                        Signed in as @{user.telegramId}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-500"
                                        onClick={() => {
                                            setMobileMenuOpen(false)
                                            handleLogout()
                                        }}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Log out
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
