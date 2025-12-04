import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/', '/watchlist', '/alerts', '/sectors', '/compare']

// Routes that are only for non-authenticated users
const authRoutes = ['/login', '/signup', '/verify']

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value
    const { pathname } = request.nextUrl

    // Check if the path is a protected route
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )

    // Check if the path is an auth route
    const isAuthRoute = authRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )

    // If user is not authenticated and trying to access protected route
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // If user is authenticated and trying to access auth routes
    if (isAuthRoute && token) {
        // Don't redirect from verify page if they're in the middle of verification
        if (pathname === '/verify') {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}
