import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sector definitions
export const sectors = [
    {
        name: 'Technology',
        description: 'IT Services, Software, and Technology Companies',
    },
    {
        name: 'Banking & Finance',
        description: 'Banks, NBFCs, and Financial Services',
    },
    {
        name: 'Pharma & Healthcare',
        description: 'Pharmaceutical and Healthcare Companies',
    },
    {
        name: 'Auto & Industrial',
        description: 'Automobile, Auto Components, and Industrial Manufacturing',
    },
    {
        name: 'Consumer Goods',
        description: 'FMCG, Consumer Durables, and Retail',
    },
    {
        name: 'Energy & Power',
        description: 'Oil & Gas, Power Generation, and Renewable Energy',
    },
    {
        name: 'Real Estate & Infrastructure',
        description: 'Real Estate, Construction, and Infrastructure',
    },
    {
        name: 'Telecommunications',
        description: 'Telecom Services and Equipment',
    },
    {
        name: 'Metals & Mining',
        description: 'Steel, Metals, Mining, and Commodities',
    },
    {
        name: 'Diversified',
        description: 'Conglomerates and Diversified Companies',
    },
]

// Stock-to-sector mapping
export const stockSectorMapping: { [key: string]: string } = {
    // Technology
    'TCS.NS': 'Technology',
    'INFY.NS': 'Technology',
    'WIPRO.NS': 'Technology',
    'HCLTECH.NS': 'Technology',
    'TECHM.NS': 'Technology',

    // Banking & Finance
    'HDFCBANK.NS': 'Banking & Finance',
    'ICICIBANK.NS': 'Banking & Finance',
    'KOTAKBANK.NS': 'Banking & Finance',
    'SBIN.NS': 'Banking & Finance',
    'AXISBANK.NS': 'Banking & Finance',

    // Pharma & Healthcare
    'SUNPHARMA.NS': 'Pharma & Healthcare',
    'DRREDDY.NS': 'Pharma & Healthcare',
    'CIPLA.NS': 'Pharma & Healthcare',

    // Auto & Industrial
    'MARUTI.NS': 'Auto & Industrial',
    'TATAMOTORS.NS': 'Auto & Industrial',

    // Consumer Goods
    'HINDUNILVR.NS': 'Consumer Goods',
    'ITC.NS': 'Consumer Goods',
    'TITAN.NS': 'Consumer Goods',

    // Energy & Power
    'RELIANCE.NS': 'Energy & Power',
    'ONGC.NS': 'Energy & Power',

    // Real Estate & Infrastructure
    'LT.NS': 'Real Estate & Infrastructure',
    'DLF.NS': 'Real Estate & Infrastructure',

    // Telecommunications
    'BHARTIARTL.NS': 'Telecommunications',

    // Metals & Mining
    'TATASTEEL.NS': 'Metals & Mining',
    'JSWSTEEL.NS': 'Metals & Mining',
}

/**
 * Seed the database with sectors and stock mappings
 */
export async function seedSectorsAndStocks() {
    try {
        console.log('🌱 Starting sector and stock seeding...')

        // Create sectors
        for (const sector of sectors) {
            await prisma.sector.upsert({
                where: { name: sector.name },
                update: { description: sector.description },
                create: sector,
            })
        }
        console.log(`✓ Created ${sectors.length} sectors`)

        // Create stocks with sector associations
        let stockCount = 0
        for (const [symbol, sectorName] of Object.entries(stockSectorMapping)) {
            const sector = await prisma.sector.findUnique({
                where: { name: sectorName },
            })

            if (sector) {
                const name = symbol.replace('.NS', '')

                await prisma.stock.upsert({
                    where: { symbol },
                    update: {
                        name,
                        sectorId: sector.id,
                    },
                    create: {
                        symbol,
                        name,
                        sectorId: sector.id,
                    },
                })
                stockCount++
            }
        }
        console.log(`✓ Created ${stockCount} stocks`)

        console.log('✅ Seeding completed successfully!')
        return { success: true, sectors: sectors.length, stocks: stockCount }
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`
if (isMainModule) {
    seedSectorsAndStocks()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
}
