import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Complete list of sectors with their stocks from NSE
const SECTORS_DATA = {
    'IT & Technology': {
        description: 'Information Technology and Software Companies',
        stocks: [
            { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
            { symbol: 'INFY.NS', name: 'Infosys' },
            { symbol: 'WIPRO.NS', name: 'Wipro' },
            { symbol: 'HCLTECH.NS', name: 'HCL Technologies' },
            { symbol: 'TECHM.NS', name: 'Tech Mahindra' },
            { symbol: 'LTIM.NS', name: 'LTIMindtree' },
            { symbol: 'MPHASIS.NS', name: 'Mphasis' },
            { symbol: 'COFORGE.NS', name: 'Coforge' },
            { symbol: 'PERSISTENT.NS', name: 'Persistent Systems' },
            { symbol: 'MINDTREE.NS', name: 'Mindtree' },
            { symbol: 'CYIENT.NS', name: 'Cyient' },
            { symbol: 'SONATSOFTW.NS', name: 'Sonata Software' },
            { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi' },
            { symbol: 'NEWGEN.NS', name: 'Newgen Software Technologies' },
            { symbol: 'HAPPSTMNDS.NS', name: 'Happiest Minds Technologies' },
        ],
    },
    'Banking': {
        description: 'Banking and Financial Institutions',
        stocks: [
            { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
            { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
            { symbol: 'SBIN.NS', name: 'State Bank of India' },
            { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
            { symbol: 'AXISBANK.NS', name: 'Axis Bank' },
            { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank' },
            { symbol: 'BANKBARODA.NS', name: 'Bank of Baroda' },
            { symbol: 'PNB.NS', name: 'Punjab National Bank' },
            { symbol: 'CANBK.NS', name: 'Canara Bank' },
            { symbol: 'UNIONBANK.NS', name: 'Union Bank of India' },
            { symbol: 'IDFCFIRSTB.NS', name: 'IDFC First Bank' },
            { symbol: 'FEDERALBNK.NS', name: 'Federal Bank' },
            { symbol: 'BANDHANBNK.NS', name: 'Bandhan Bank' },
            { symbol: 'AUBANK.NS', name: 'AU Small Finance Bank' },
            { symbol: 'RBLBANK.NS', name: 'RBL Bank' },
        ],
    },
    'Financial Services': {
        description: 'NBFC, Insurance and Financial Services',
        stocks: [
            { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
            { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv' },
            { symbol: 'ABCAPITAL.NS', name: 'Aditya Birla Capital' },
            { symbol: 'MUTHOOTFIN.NS', name: 'Muthoot Finance' },
            { symbol: 'CHOLAFIN.NS', name: 'Cholamandalam Investment' },
            { symbol: 'SHRIRAMFIN.NS', name: 'Shriram Finance' },
            { symbol: 'MANAPPURAM.NS', name: 'Manappuram Finance' },
            { symbol: 'POONAWALLA.NS', name: 'Poonawalla Fincorp' },
            { symbol: 'SBICARD.NS', name: 'SBI Cards' },
            { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance' },
            { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance' },
            { symbol: 'ICICIPRULI.NS', name: 'ICICI Prudential Life Insurance' },
            { symbol: 'ICICIGI.NS', name: 'ICICI Lombard General Insurance' },
            { symbol: 'NIACL.NS', name: 'New India Assurance Co' },
            { symbol: 'GICRE.NS', name: 'GIC Re' },
        ],
    },
    'Oil & Gas': {
        description: 'Oil, Gas and Petroleum Companies',
        stocks: [
            { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
            { symbol: 'ONGC.NS', name: 'Oil and Natural Gas Corporation' },
            { symbol: 'BPCL.NS', name: 'Bharat Petroleum' },
            { symbol: 'IOC.NS', name: 'Indian Oil Corporation' },
            { symbol: 'HINDPETRO.NS', name: 'Hindustan Petroleum' },
            { symbol: 'GAIL.NS', name: 'GAIL India' },
            { symbol: 'IGL.NS', name: 'Indraprastha Gas' },
            { symbol: 'MGL.NS', name: 'Mahanagar Gas' },
            { symbol: 'PETRONET.NS', name: 'Petronet LNG' },
            { symbol: 'CASTROLIND.NS', name: 'Castrol India' },
            { symbol: 'AEGISCHEM.NS', name: 'Aegis Logistics' },
            { symbol: 'GSPL.NS', name: 'Gujarat State Petronet' },
            { symbol: 'GUJGASLTD.NS', name: 'Gujarat Gas' },
            { symbol: 'OIL.NS', name: 'Oil India' },
            { symbol: 'MRPL.NS', name: 'Mangalore Refinery' },
        ],
    },
    'Automobile': {
        description: 'Automobile and Auto Ancillary Companies',
        stocks: [
            { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
            { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
            { symbol: 'M&M.NS', name: 'Mahindra & Mahindra' },
            { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto' },
            { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp' },
            { symbol: 'EICHERMOT.NS', name: 'Eicher Motors' },
            { symbol: 'ASHOKLEY.NS', name: 'Ashok Leyland' },
            { symbol: 'TVS.NS', name: 'TVS Motor' },
            { symbol: 'MOTHERSON.NS', name: 'Motherson Sumi' },
            { symbol: 'BHARATFORG.NS', name: 'Bharat Forge' },
            { symbol: 'BOSCHLTD.NS', name: 'Bosch India' },
            { symbol: 'MRF.NS', name: 'MRF' },
            { symbol: 'APOLLOTYRE.NS', name: 'Apollo Tyres' },
            { symbol: 'BALKRISIND.NS', name: 'Balkrishna Industries' },
            { symbol: 'CEATLTD.NS', name: 'CEAT' },
        ],
    },
    'Pharmaceuticals & Healthcare': {
        description: 'Pharmaceutical and Healthcare Companies',
        stocks: [
            { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma' },
            { symbol: 'DRREDDY.NS', name: 'Dr Reddys Laboratories' },
            { symbol: 'CIPLA.NS', name: 'Cipla' },
            { symbol: 'DIVISLAB.NS', name: 'Divis Laboratories' },
            { symbol: 'LUPIN.NS', name: 'Lupin' },
            { symbol: 'AUROPHARMA.NS', name: 'Aurobindo Pharma' },
            { symbol: 'TORNTPHARM.NS', name: 'Torrent Pharmaceuticals' },
            { symbol: 'ALKEM.NS', name: 'Alkem Laboratories' },
            { symbol: 'BIOCON.NS', name: 'Biocon' },
            { symbol: 'ZYDUSLIFE.NS', name: 'Zydus Lifesciences' },
            { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals' },
            { symbol: 'FORTIS.NS', name: 'Fortis Healthcare' },
            { symbol: 'MAXHEALTH.NS', name: 'Max Healthcare' },
            { symbol: 'METROPOLIS.NS', name: 'Metropolis Healthcare' },
            { symbol: 'LALPATHLAB.NS', name: 'Dr Lal PathLabs' },
        ],
    },
    'Consumer Goods': {
        description: 'FMCG and Consumer Products',
        stocks: [
            { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
            { symbol: 'ITC.NS', name: 'ITC' },
            { symbol: 'NESTLEIND.NS', name: 'Nestle India' },
            { symbol: 'BRITANNIA.NS', name: 'Britannia Industries' },
            { symbol: 'DABUR.NS', name: 'Dabur India' },
            { symbol: 'GODREJCP.NS', name: 'Godrej Consumer Products' },
            { symbol: 'MARICO.NS', name: 'Marico' },
            { symbol: 'COLPAL.NS', name: 'Colgate Palmolive India' },
            { symbol: 'EMAMILTD.NS', name: 'Emami' },
            { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products' },
            { symbol: 'PGHH.NS', name: 'Procter & Gamble Hygiene' },
            { symbol: 'BATAINDIA.NS', name: 'Bata India' },
            { symbol: 'TITAN.NS', name: 'Titan Company' },
            { symbol: 'PAGEIND.NS', name: 'Page Industries' },
            { symbol: 'VBL.NS', name: 'Varun Beverages' },
        ],
    },
    'Infrastructure & Construction': {
        description: 'Infrastructure, Construction and Engineering',
        stocks: [
            { symbol: 'LT.NS', name: 'Larsen & Toubro' },
            { symbol: 'ADANIPORTS.NS', name: 'Adani Ports' },
            { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement' },
            { symbol: 'GRASIM.NS', name: 'Grasim Industries' },
            { symbol: 'SHREECEM.NS', name: 'Shree Cement' },
            { symbol: 'ACC.NS', name: 'ACC' },
            { symbol: 'AMBUJACEM.NS', name: 'Ambuja Cements' },
            { symbol: 'DALBHARAT.NS', name: 'Dalmia Bharat' },
            { symbol: 'RAMCOCEM.NS', name: 'Ramco Cements' },
            { symbol: 'JKCEMENT.NS', name: 'JK Cement' },
            { symbol: 'IRB.NS', name: 'IRB Infrastructure' },
            { symbol: 'NBCC.NS', name: 'NBCC India' },
            { symbol: 'OBEROIRLTY.NS', name: 'Oberoi Realty' },
            { symbol: 'DLF.NS', name: 'DLF' },
            { symbol: 'GODREJPROP.NS', name: 'Godrej Properties' },
        ],
    },
    'Power & Energy': {
        description: 'Power Generation and Energy Companies',
        stocks: [
            { symbol: 'NTPC.NS', name: 'NTPC' },
            { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation' },
            { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy' },
            { symbol: 'ADANIPOWER.NS', name: 'Adani Power' },
            { symbol: 'TATAPOWER.NS', name: 'Tata Power' },
            { symbol: 'COALINDIA.NS', name: 'Coal India' },
            { symbol: 'NHPC.NS', name: 'NHPC' },
            { symbol: 'SJVN.NS', name: 'SJVN' },
            { symbol: 'CESC.NS', name: 'CESC' },
            { symbol: 'TORNTPOWER.NS', name: 'Torrent Power' },
            { symbol: 'JSWENERGY.NS', name: 'JSW Energy' },
            { symbol: 'NLCINDIA.NS', name: 'NLC India' },
            { symbol: 'PTC.NS', name: 'PTC India' },
            { symbol: 'TATAPOWR.NS', name: 'Tata Power' },
            { symbol: 'RECLTD.NS', name: 'REC Limited' },
        ],
    },
    'Metals & Mining': {
        description: 'Metal, Mining and Steel Companies',
        stocks: [
            { symbol: 'TATASTEEL.NS', name: 'Tata Steel' },
            { symbol: 'JSWSTEEL.NS', name: 'JSW Steel' },
            { symbol: 'HINDALCO.NS', name: 'Hindalco Industries' },
            { symbol: 'VEDL.NS', name: 'Vedanta' },
            { symbol: 'JINDALSTEL.NS', name: 'Jindal Steel & Power' },
            { symbol: 'SAIL.NS', name: 'Steel Authority of India' },
            { symbol: 'NMDC.NS', name: 'NMDC' },
            { symbol: 'NATIONALUM.NS', name: 'National Aluminium' },
            { symbol: 'HINDZINC.NS', name: 'Hindustan Zinc' },
            { symbol: 'MOIL.NS', name: 'MOIL' },
            { symbol: 'WELCORP.NS', name: 'Welspun Corp' },
            { symbol: 'RATNAMANI.NS', name: 'Ratnamani Metals' },
            { symbol: 'APLAPOLLO.NS', name: 'APL Apollo Tubes' },
            { symbol: 'SHYAMMETL.NS', name: 'Shyam Metalics' },
            { symbol: 'GMRINFRA.NS', name: 'GMR Infrastructure' },
        ],
    },
    'Telecom': {
        description: 'Telecommunications and Media',
        stocks: [
            { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
            { symbol: 'IDEA.NS', name: 'Vodafone Idea' },
            { symbol: 'TATACOMM.NS', name: 'Tata Communications' },
            { symbol: 'HFCL.NS', name: 'HFCL' },
            { symbol: 'STLTECH.NS', name: 'Sterlite Technologies' },
            { symbol: 'ITI.NS', name: 'ITI' },
            { symbol: 'TEJAS.NS', name: 'Tejas Networks' },
            { symbol: 'RAILTEL.NS', name: 'RailTel Corporation' },
            { symbol: 'GTPL.NS', name: 'GTPL Hathway' },
            { symbol: 'DEN.NS', name: 'DEN Networks' },
        ],
    },
    'Real Estate': {
        description: 'Real Estate and Property Development',
        stocks: [
            { symbol: 'DLF.NS', name: 'DLF' },
            { symbol: 'GODREJPROP.NS', name: 'Godrej Properties' },
            { symbol: 'OBEROIRLTY.NS', name: 'Oberoi Realty' },
            { symbol: 'PHOENIXLTD.NS', name: 'Phoenix Mills' },
            { symbol: 'PRESTIGE.NS', name: 'Prestige Estates' },
            { symbol: 'BRIGADE.NS', name: 'Brigade Enterprises' },
            { symbol: 'SOBHA.NS', name: 'Sobha Limited' },
            { symbol: 'MAHLIFE.NS', name: 'Mahindra Lifespaces' },
            { symbol: 'SUNTECK.NS', name: 'Sunteck Realty' },
            { symbol: 'LODHA.NS', name: 'Macrotech Developers' },
        ],
    },
    'Chemicals': {
        description: 'Chemical and Specialty Chemical Companies',
        stocks: [
            { symbol: 'PIDILITIND.NS', name: 'Pidilite Industries' },
            { symbol: 'UPL.NS', name: 'UPL' },
            { symbol: 'SRF.NS', name: 'SRF' },
            { symbol: 'AARTIIND.NS', name: 'Aarti Industries' },
            { symbol: 'DEEPAKFERT.NS', name: 'Deepak Fertilizers' },
            { symbol: 'DEEPAKNTR.NS', name: 'Deepak Nitrite' },
            { symbol: 'NAVINFLUOR.NS', name: 'Navin Fluorine' },
            { symbol: 'FLUOROCHEM.NS', name: 'Gujarat Fluorochemicals' },
            { symbol: 'ALKYLAMINE.NS', name: 'Alkyl Amines Chemicals' },
            { symbol: 'CLEAN.NS', name: 'Clean Science and Technology' },
            { symbol: 'TATACHEM.NS', name: 'Tata Chemicals' },
            { symbol: 'COROMANDEL.NS', name: 'Coromandel International' },
            { symbol: 'GNFC.NS', name: 'GNFC' },
            { symbol: 'GSFC.NS', name: 'GSFC' },
            { symbol: 'BALRAMCHIN.NS', name: 'Balrampur Chini Mills' },
        ],
    },
    'E-Commerce & Internet': {
        description: 'E-Commerce and Digital Platform Companies',
        stocks: [
            { symbol: 'ZOMATO.NS', name: 'Zomato' },
            { symbol: 'PAYTM.NS', name: 'Paytm' },
            { symbol: 'NYKAA.NS', name: 'FSN E-Commerce' },
            { symbol: 'POLICYBZR.NS', name: 'PB Fintech' },
            { symbol: 'DELHIVERY.NS', name: 'Delhivery' },
            { symbol: 'CARTRADE.NS', name: 'CarTrade Tech' },
            { symbol: 'NAZARA.NS', name: 'Nazara Technologies' },
            { symbol: 'INFOEDGE.NS', name: 'Info Edge India' },
            { symbol: 'JUSTDIAL.NS', name: 'Just Dial' },
            { symbol: 'INDIAMART.NS', name: 'IndiaMART InterMESH' },
        ],
    },
    'Media & Entertainment': {
        description: 'Media, Entertainment and Broadcasting',
        stocks: [
            { symbol: 'SUNTV.NS', name: 'Sun TV Network' },
            { symbol: 'ZEEL.NS', name: 'Zee Entertainment' },
            { symbol: 'PVR.NS', name: 'PVR INOX' },
            { symbol: 'NETWORK18.NS', name: 'Network18 Media' },
            { symbol: 'TV18BRDCST.NS', name: 'TV18 Broadcast' },
            { symbol: 'SAREGAMA.NS', name: 'Saregama India' },
            { symbol: 'TIPS.NS', name: 'Tips Industries' },
            { symbol: 'HATHWAY.NS', name: 'Hathway Cable' },
            { symbol: 'RADIOCITY.NS', name: 'Music Broadcast' },
            { symbol: 'UFO.NS', name: 'UFO Moviez' },
        ],
    },
    'Defence': {
        description: 'Defence and Aerospace Companies',
        stocks: [
            { symbol: 'HAL.NS', name: 'Hindustan Aeronautics' },
            { symbol: 'BEL.NS', name: 'Bharat Electronics' },
            { symbol: 'BEML.NS', name: 'BEML' },
            { symbol: 'BDL.NS', name: 'Bharat Dynamics' },
            { symbol: 'MAZAGON.NS', name: 'Mazagon Dock' },
            { symbol: 'COCHINSHIP.NS', name: 'Cochin Shipyard' },
            { symbol: 'GRSE.NS', name: 'Garden Reach Shipbuilders' },
            { symbol: 'PARAS.NS', name: 'Paras Defence' },
            { symbol: 'DATAPAT.NS', name: 'Data Patterns' },
            { symbol: 'MIDHANI.NS', name: 'Mishra Dhatu Nigam' },
        ],
    },
    'Aviation & Logistics': {
        description: 'Airlines and Logistics Companies',
        stocks: [
            { symbol: 'INDIGO.NS', name: 'InterGlobe Aviation' },
            { symbol: 'SPICEJET.NS', name: 'SpiceJet' },
            { symbol: 'BLUEDART.NS', name: 'Blue Dart Express' },
            { symbol: 'CONTAINER.NS', name: 'Container Corporation' },
            { symbol: 'ALLCARGO.NS', name: 'Allcargo Logistics' },
            { symbol: 'TCI.NS', name: 'Transport Corporation' },
            { symbol: 'GATI.NS', name: 'Gati' },
            { symbol: 'VRL.NS', name: 'VRL Logistics' },
            { symbol: 'MAHLOG.NS', name: 'Mahindra Logistics' },
            { symbol: 'GMRAIRPORT.NS', name: 'GMR Airports' },
        ],
    },
    'Textiles & Apparel': {
        description: 'Textile and Apparel Manufacturing',
        stocks: [
            { symbol: 'RAYMOND.NS', name: 'Raymond' },
            { symbol: 'ARVIND.NS', name: 'Arvind' },
            { symbol: 'WELSPUNIND.NS', name: 'Welspun India' },
            { symbol: 'VARDHMAN.NS', name: 'Vardhman Textiles' },
            { symbol: 'TRIDENT.NS', name: 'Trident' },
            { symbol: 'SYNGENE.NS', name: 'Syngene International' },
            { symbol: 'GOKEX.NS', name: 'Gokaldas Exports' },
            { symbol: 'KPR.NS', name: 'KPR Mill' },
            { symbol: 'LXCHEM.NS', name: 'Lux Industries' },
            { symbol: 'TCNSBRANDS.NS', name: 'TCNS Clothing' },
        ],
    },
    'Hotels & Tourism': {
        description: 'Hospitality, Hotels and Tourism',
        stocks: [
            { symbol: 'INDHOTEL.NS', name: 'Indian Hotels' },
            { symbol: 'LEMONTREE.NS', name: 'Lemon Tree Hotels' },
            { symbol: 'CHALET.NS', name: 'Chalet Hotels' },
            { symbol: 'EIHOTEL.NS', name: 'EIH' },
            { symbol: 'MAHINDHOLIDAY.NS', name: 'Mahindra Holidays' },
            { symbol: 'THOMASCOOK.NS', name: 'Thomas Cook India' },
            { symbol: 'UTKARSHBNK.NS', name: 'Utkarsh Small Finance Bank' },
            { symbol: 'JUNIPER.NS', name: 'Juniper Hotels' },
            { symbol: 'RFRH.NS', name: 'Radisson Hotel Group' },
            { symbol: 'SAMHI.NS', name: 'Samhi Hotels' },
        ],
    },
    'Education': {
        description: 'Education and Edtech Companies',
        stocks: [
            { symbol: 'APTUS.NS', name: 'Aptus Value Housing' },
            { symbol: 'AFCONS.NS', name: 'Afcons Infrastructure' },
            { symbol: 'VGUARD.NS', name: 'V-Guard Industries' },
            { symbol: 'CERA.NS', name: 'Cera Sanitaryware' },
            { symbol: 'CARBORUNIV.NS', name: 'Carborundum Universal' },
        ],
    },
}

async function main() {
    console.log('🌱 Starting database seed...')

    // Clear existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.stock.deleteMany({})
    await prisma.sector.deleteMany({})

    // Create sectors and stocks
    console.log('📊 Creating sectors and stocks...')

    for (const [sectorName, sectorData] of Object.entries(SECTORS_DATA)) {
        console.log(`  Creating sector: ${sectorName}`)

        const sector = await prisma.sector.create({
            data: {
                name: sectorName,
                description: sectorData.description,
            },
        })

        // Create stocks for this sector
        for (const stock of sectorData.stocks) {
            try {
                await prisma.stock.create({
                    data: {
                        symbol: stock.symbol,
                        name: stock.name,
                        sectorId: sector.id,
                    },
                })
            } catch (error) {
                // Skip duplicate stocks (some stocks may appear in multiple categories)
                console.log(`    ⚠️ Skipping duplicate: ${stock.symbol}`)
            }
        }

        console.log(`    ✅ Created ${sectorData.stocks.length} stocks`)
    }

    // Get summary
    const sectorCount = await prisma.sector.count()
    const stockCount = await prisma.stock.count()

    console.log('\n✅ Seed completed successfully!')
    console.log(`   📁 Sectors: ${sectorCount}`)
    console.log(`   📈 Stocks: ${stockCount}`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
