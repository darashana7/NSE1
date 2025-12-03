import { NextRequest, NextResponse } from 'next/server'
import { toggleWatchlist } from '@/lib/watchlistStore'

export async function POST(request: NextRequest) {
  try {
    const { symbol, name } = await request.json()

    if (!symbol || !name) {
      return NextResponse.json(
        { error: 'Symbol and name are required' },
        { status: 400 }
      )
    }

    const action = toggleWatchlist(symbol, name)

    return NextResponse.json({
      message: action === 'added' ? 'Added to watchlist' : 'Removed from watchlist',
      action
    })
  } catch (error) {
    console.error('Error toggling watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to toggle watchlist' },
      { status: 500 }
    )
  }
}