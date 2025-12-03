'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface LiveStockPrice {
    symbol: string
    price: number
    change: number
    changePercent: number
    volume: string
    timestamp: number
}

interface UseLiveStockPricesReturn {
    prices: Map<string, LiveStockPrice>
    isConnected: boolean
    error: string | null
    reconnect: () => void
}

export function useLiveStockPrices(symbols: string[]): UseLiveStockPricesReturn {
    const [prices, setPrices] = useState<Map<string, LiveStockPrice>>(new Map())
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const connect = useCallback(() => {
        // Clear any existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }

        if (symbols.length === 0) {
            setIsConnected(false)
            return
        }

        try {
            const symbolsParam = symbols.join(',')
            const eventSource = new EventSource(`/api/stocks/ws?symbols=${encodeURIComponent(symbolsParam)}`)

            eventSource.onopen = () => {
                console.log('[LivePrices] Connection established')
                setIsConnected(true)
                setError(null)
            }

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.type === 'connected') {
                        console.log('[LivePrices] Connected to live feed:', data.symbols)
                    } else if (data.type === 'prices') {
                        // Update prices map
                        setPrices((prev) => {
                            const newPrices = new Map(prev)
                            data.data.forEach((stock: LiveStockPrice) => {
                                newPrices.set(stock.symbol, stock)
                            })
                            return newPrices
                        })
                    } else if (data.type === 'error') {
                        console.error('[LivePrices] Server error:', data.message)
                        setError(data.message)
                    }
                } catch (err) {
                    console.error('[LivePrices] Failed to parse message:', err)
                }
            }

            eventSource.onerror = (err) => {
                console.error('[LivePrices] EventSource error:', err)
                setIsConnected(false)
                setError('Connection lost')
                eventSource.close()

                // Auto-reconnect after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('[LivePrices] Attempting to reconnect...')
                    connect()
                }, 5000)
            }

            eventSourceRef.current = eventSource
        } catch (err) {
            console.error('[LivePrices] Failed to establish connection:', err)
            setError('Failed to connect')
            setIsConnected(false)
        }
    }, [symbols])

    const reconnect = useCallback(() => {
        connect()
    }, [connect])

    useEffect(() => {
        connect()

        // Cleanup on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [connect])

    return {
        prices,
        isConnected,
        error,
        reconnect,
    }
}
