// Shared in-memory watchlist storage
// In production, you would use a database

export interface WatchlistItem {
    symbol: string
    name: string
}

let watchlist: WatchlistItem[] = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' }
]

export function getWatchlist(): WatchlistItem[] {
    return [...watchlist]
}

export function addToWatchlist(symbol: string, name: string): boolean {
    const exists = watchlist.some(item => item.symbol === symbol)
    if (!exists) {
        watchlist.push({ symbol, name })
        return true
    }
    return false
}

export function removeFromWatchlist(symbol: string): boolean {
    const index = watchlist.findIndex(item => item.symbol === symbol)
    if (index !== -1) {
        watchlist.splice(index, 1)
        return true
    }
    return false
}

export function isInWatchlist(symbol: string): boolean {
    return watchlist.some(item => item.symbol === symbol)
}

export function toggleWatchlist(symbol: string, name: string): 'added' | 'removed' {
    const index = watchlist.findIndex(item => item.symbol === symbol)
    if (index !== -1) {
        watchlist.splice(index, 1)
        return 'removed'
    } else {
        watchlist.push({ symbol, name })
        return 'added'
    }
}
