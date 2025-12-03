'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Bell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AlertDialogProps {
    symbol: string
    name: string
    currentPrice: number
}

export function AlertDialog({ symbol, name, currentPrice }: AlertDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [alertType, setAlertType] = useState('PRICE_ABOVE')
    const [targetValue, setTargetValue] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreateAlert = async () => {
        if (!targetValue || parseFloat(targetValue) <= 0) {
            toast({
                title: 'Invalid Value',
                description: 'Please enter a valid target value',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/alert/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol,
                    name,
                    alertType,
                    targetValue: parseFloat(targetValue),
                }),
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: '✓ Alert Created',
                    description: `You'll be notified when ${name} ${getAlertDescription()}`,
                })
                setOpen(false)
                setTargetValue('')
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to create alert',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while creating the alert',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const getAlertDescription = () => {
        const value = parseFloat(targetValue)
        switch (alertType) {
            case 'PRICE_ABOVE':
                return `reaches ₹${value}`
            case 'PRICE_BELOW':
                return `drops below ₹${value}`
            case 'PERCENT_CHANGE_UP':
                return `increases by ${value}%`
            case 'PERCENT_CHANGE_DOWN':
                return `decreases by ${value}%`
            default:
                return ''
        }
    }

    const getPlaceholder = () => {
        switch (alertType) {
            case 'PRICE_ABOVE':
            case 'PRICE_BELOW':
                return `e.g., ${currentPrice.toFixed(2)}`
            case 'PERCENT_CHANGE_UP':
            case 'PERCENT_CHANGE_DOWN':
                return 'e.g., 5.0'
            default:
                return 'Enter value'
        }
    }

    const getValueLabel = () => {
        switch (alertType) {
            case 'PRICE_ABOVE':
            case 'PRICE_BELOW':
                return 'Target Price (₹)'
            case 'PERCENT_CHANGE_UP':
            case 'PERCENT_CHANGE_DOWN':
                return 'Percentage Change (%)'
            default:
                return 'Value'
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Set Alert
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Price Alert</DialogTitle>
                    <DialogDescription>
                        Set up an alert for {name} ({symbol.replace('.NS', '')})
                        <br />
                        Current Price: ₹{currentPrice.toFixed(2)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="alertType">Alert Type</Label>
                        <Select value={alertType} onValueChange={setAlertType}>
                            <SelectTrigger id="alertType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PRICE_ABOVE">Price Reaches Above</SelectItem>
                                <SelectItem value="PRICE_BELOW">Price Drops Below</SelectItem>
                                <SelectItem value="PERCENT_CHANGE_UP">
                                    Percentage Increase
                                </SelectItem>
                                <SelectItem value="PERCENT_CHANGE_DOWN">
                                    Percentage Decrease
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="targetValue">{getValueLabel()}</Label>
                        <Input
                            id="targetValue"
                            type="number"
                            step="0.01"
                            placeholder={getPlaceholder()}
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                        />
                    </div>
                    {targetValue && parseFloat(targetValue) > 0 && (
                        <div className="rounded-lg bg-muted p-3 text-sm">
                            <p className="font-medium">Alert Preview:</p>
                            <p className="text-muted-foreground mt-1">
                                You'll be notified when {name} {getAlertDescription()}
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleCreateAlert} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Alert'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
