import TelegramBot from 'node-telegram-bot-api'

// Initialize bot (only on server-side)
let bot: TelegramBot | null = null

function getBot(): TelegramBot {
    if (!bot) {
        const token = process.env.TELEGRAM_BOT_TOKEN
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN is not set')
        }
        bot = new TelegramBot(token, { polling: false })
    }
    return bot
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send verification code to user via Telegram
 */
export async function sendVerificationCode(
    telegramId: string,
    code: string
): Promise<boolean> {
    try {
        const bot = getBot()
        const message = `🔐 NSE Stock Dashboard\n\nYour verification code is: *${code}*\n\n⏰ This code expires in 5 minutes.\n\n⚠️ Never share this code with anyone.`

        await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' })
        return true
    } catch (error) {
        console.error('Failed to send Telegram message:', error)
        return false
    }
}

/**
 * Send login notification to user
 */
export async function sendLoginNotification(
    telegramId: string,
    ipAddress?: string
): Promise<boolean> {
    try {
        const bot = getBot()
        const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        const message = `🔔 New Login\n\n📱 NSE Stock Dashboard\n⏰ ${time}\n${ipAddress ? `📍 IP: ${ipAddress}` : ''}\n\nIf this wasn't you, please secure your account immediately.`

        await bot.sendMessage(telegramId, message)
        return true
    } catch (error) {
        console.error('Failed to send login notification:', error)
        return false
    }
}

/**
 * Send welcome message after successful signup
 */
export async function sendWelcomeMessage(
    telegramId: string,
    name?: string
): Promise<boolean> {
    try {
        const bot = getBot()
        const message = `🎉 Welcome to NSE Stock Dashboard${name ? `, ${name}` : ''}!\n\n✅ Your account has been verified successfully.\n\n📈 Features available:\n• Real-time stock tracking\n• Price alerts\n• Watchlist management\n• Sector performance analysis\n\nEnjoy trading! 📊`

        await bot.sendMessage(telegramId, message)
        return true
    } catch (error) {
        console.error('Failed to send welcome message:', error)
        return false
    }
}
