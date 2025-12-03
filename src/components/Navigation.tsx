'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Star, Bell, BarChart3, GitCompare, Menu, X, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Badge } from '@/components/ui/badge'

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/watchlist', label: 'Watchlist', icon: Star },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/sectors', label: 'Sectors', icon: BarChart3 },
    { href: '/compare', label: 'Compare', icon: GitCompare },
]

export function Navigation() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                    </div>
                )}
            </div>
        </nav>
    )
}
