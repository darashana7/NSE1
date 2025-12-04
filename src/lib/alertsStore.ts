// Shared in-memory alerts storage
// In production with database, use Prisma models

export interface Alert {
    id: string
    symbol: string
    name: string
    alertType: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_CHANGE_UP' | 'PERCENT_CHANGE_DOWN'
    targetValue: number
    currentValue?: number
    isActive: boolean
    isTriggered: boolean
    triggeredAt?: string
    createdAt: string
    updatedAt: string
}

// Generate unique ID
function generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// In-memory storage
let alerts: Alert[] = []

export function getAlerts(status?: 'active' | 'triggered' | 'all'): Alert[] {
    let filtered = [...alerts]

    if (status === 'active') {
        filtered = filtered.filter(a => a.isActive && !a.isTriggered)
    } else if (status === 'triggered') {
        filtered = filtered.filter(a => a.isTriggered)
    }

    // Sort by createdAt descending
    return filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function getAlertById(id: string): Alert | undefined {
    return alerts.find(a => a.id === id)
}

export function createAlert(data: {
    symbol: string
    name: string
    alertType: Alert['alertType']
    targetValue: number
}): Alert {
    const now = new Date().toISOString()
    const newAlert: Alert = {
        id: generateId(),
        symbol: data.symbol,
        name: data.name,
        alertType: data.alertType,
        targetValue: data.targetValue,
        isActive: true,
        isTriggered: false,
        createdAt: now,
        updatedAt: now,
    }

    alerts.push(newAlert)
    return newAlert
}

export function updateAlert(id: string, updates: Partial<Alert>): Alert | null {
    const index = alerts.findIndex(a => a.id === id)
    if (index === -1) return null

    alerts[index] = {
        ...alerts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    }

    return alerts[index]
}

export function deleteAlert(id: string): boolean {
    const index = alerts.findIndex(a => a.id === id)
    if (index === -1) return false

    alerts.splice(index, 1)
    return true
}

export function toggleAlertActive(id: string): Alert | null {
    const index = alerts.findIndex(a => a.id === id)
    if (index === -1) return null

    alerts[index].isActive = !alerts[index].isActive
    alerts[index].updatedAt = new Date().toISOString()

    return alerts[index]
}

export function triggerAlert(id: string, currentValue: number): Alert | null {
    const index = alerts.findIndex(a => a.id === id)
    if (index === -1) return null

    alerts[index].isTriggered = true
    alerts[index].triggeredAt = new Date().toISOString()
    alerts[index].currentValue = currentValue
    alerts[index].updatedAt = new Date().toISOString()

    return alerts[index]
}

// Check if price triggers any alerts
export function checkAlerts(symbol: string, currentPrice: number): Alert[] {
    const triggeredAlerts: Alert[] = []

    alerts.forEach((alert, index) => {
        if (alert.symbol !== symbol || !alert.isActive || alert.isTriggered) {
            return
        }

        let shouldTrigger = false

        switch (alert.alertType) {
            case 'PRICE_ABOVE':
                shouldTrigger = currentPrice >= alert.targetValue
                break
            case 'PRICE_BELOW':
                shouldTrigger = currentPrice <= alert.targetValue
                break
            // For percent change, we'd need the previous price
            // This is a simplified implementation
            default:
                break
        }

        if (shouldTrigger) {
            alerts[index].isTriggered = true
            alerts[index].triggeredAt = new Date().toISOString()
            alerts[index].currentValue = currentPrice
            alerts[index].updatedAt = new Date().toISOString()
            triggeredAlerts.push(alerts[index])
        }
    })

    return triggeredAlerts
}

// Get alerts for a specific symbol
export function getAlertsBySymbol(symbol: string): Alert[] {
    return alerts.filter(a => a.symbol === symbol)
}
