// Complete list of sectors with their stocks from NSE
// This is used as fallback when database is not available

export interface SectorData {
    id: string
    name: string
    description: string
    stocks: { symbol: string; name: string }[]
}

export const SECTORS_DATA: SectorData[] = [
    {
        id: 'sector-it',
        name: 'IT & Technology',
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
            { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi' },
        ],
    },
    {
        id: 'sector-banking',
        name: 'Banking',
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
            { symbol: 'FEDERALBNK.NS', name: 'Federal Bank' },
        ],
    },
    {
        id: 'sector-financial',
        name: 'Financial Services',
        description: 'NBFC, Insurance and Financial Services',
        stocks: [
            { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
            { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv' },
            { symbol: 'ABCAPITAL.NS', name: 'Aditya Birla Capital' },
            { symbol: 'MUTHOOTFIN.NS', name: 'Muthoot Finance' },
            { symbol: 'CHOLAFIN.NS', name: 'Cholamandalam Investment' },
            { symbol: 'SHRIRAMFIN.NS', name: 'Shriram Finance' },
            { symbol: 'SBICARD.NS', name: 'SBI Cards' },
            { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance' },
            { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance' },
            { symbol: 'ICICIPRULI.NS', name: 'ICICI Prudential Life Insurance' },
        ],
    },
    {
        id: 'sector-oil',
        name: 'Oil & Gas',
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
            { symbol: 'OIL.NS', name: 'Oil India' },
        ],
    },
    {
        id: 'sector-auto',
        name: 'Automobile',
        description: 'Automobile and Auto Ancillary Companies',
        stocks: [
            { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
            { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
            { symbol: 'M&M.NS', name: 'Mahindra & Mahindra' },
            { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto' },
            { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp' },
            { symbol: 'EICHERMOT.NS', name: 'Eicher Motors' },
            { symbol: 'ASHOKLEY.NS', name: 'Ashok Leyland' },
            { symbol: 'MOTHERSON.NS', name: 'Motherson Sumi' },
            { symbol: 'MRF.NS', name: 'MRF' },
            { symbol: 'APOLLOTYRE.NS', name: 'Apollo Tyres' },
        ],
    },
    {
        id: 'sector-pharma',
        name: 'Pharmaceuticals & Healthcare',
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
            { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals' },
        ],
    },
    {
        id: 'sector-fmcg',
        name: 'Consumer Goods',
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
            { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products' },
            { symbol: 'TITAN.NS', name: 'Titan Company' },
        ],
    },
    {
        id: 'sector-infra',
        name: 'Infrastructure & Construction',
        description: 'Infrastructure, Construction and Engineering',
        stocks: [
            { symbol: 'LT.NS', name: 'Larsen & Toubro' },
            { symbol: 'ADANIPORTS.NS', name: 'Adani Ports' },
            { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement' },
            { symbol: 'GRASIM.NS', name: 'Grasim Industries' },
            { symbol: 'SHREECEM.NS', name: 'Shree Cement' },
            { symbol: 'ACC.NS', name: 'ACC' },
            { symbol: 'AMBUJACEM.NS', name: 'Ambuja Cements' },
            { symbol: 'DLF.NS', name: 'DLF' },
            { symbol: 'GODREJPROP.NS', name: 'Godrej Properties' },
            { symbol: 'OBEROIRLTY.NS', name: 'Oberoi Realty' },
        ],
    },
    {
        id: 'sector-power',
        name: 'Power & Energy',
        description: 'Power Generation and Energy Companies',
        stocks: [
            { symbol: 'NTPC.NS', name: 'NTPC' },
            { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation' },
            { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy' },
            { symbol: 'TATAPOWER.NS', name: 'Tata Power' },
            { symbol: 'COALINDIA.NS', name: 'Coal India' },
            { symbol: 'NHPC.NS', name: 'NHPC' },
            { symbol: 'SJVN.NS', name: 'SJVN' },
            { symbol: 'JSWENERGY.NS', name: 'JSW Energy' },
            { symbol: 'RECLTD.NS', name: 'REC Limited' },
            { symbol: 'PFC.NS', name: 'Power Finance Corporation' },
        ],
    },
    {
        id: 'sector-metals',
        name: 'Metals & Mining',
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
            { symbol: 'APLAPOLLO.NS', name: 'APL Apollo Tubes' },
        ],
    },
    {
        id: 'sector-telecom',
        name: 'Telecom',
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
        ],
    },
    {
        id: 'sector-realty',
        name: 'Real Estate',
        description: 'Real Estate and Property Development',
        stocks: [
            { symbol: 'DLF.NS', name: 'DLF' },
            { symbol: 'GODREJPROP.NS', name: 'Godrej Properties' },
            { symbol: 'OBEROIRLTY.NS', name: 'Oberoi Realty' },
            { symbol: 'PHOENIXLTD.NS', name: 'Phoenix Mills' },
            { symbol: 'PRESTIGE.NS', name: 'Prestige Estates' },
            { symbol: 'BRIGADE.NS', name: 'Brigade Enterprises' },
            { symbol: 'SOBHA.NS', name: 'Sobha Limited' },
            { symbol: 'LODHA.NS', name: 'Macrotech Developers' },
        ],
    },
    {
        id: 'sector-chemicals',
        name: 'Chemicals',
        description: 'Chemical and Specialty Chemical Companies',
        stocks: [
            { symbol: 'PIDILITIND.NS', name: 'Pidilite Industries' },
            { symbol: 'UPL.NS', name: 'UPL' },
            { symbol: 'SRF.NS', name: 'SRF' },
            { symbol: 'AARTIIND.NS', name: 'Aarti Industries' },
            { symbol: 'DEEPAKNTR.NS', name: 'Deepak Nitrite' },
            { symbol: 'NAVINFLUOR.NS', name: 'Navin Fluorine' },
            { symbol: 'TATACHEM.NS', name: 'Tata Chemicals' },
            { symbol: 'COROMANDEL.NS', name: 'Coromandel International' },
            { symbol: 'GNFC.NS', name: 'GNFC' },
        ],
    },
    {
        id: 'sector-ecommerce',
        name: 'E-Commerce & Internet',
        description: 'E-Commerce and Digital Platform Companies',
        stocks: [
            { symbol: 'ZOMATO.NS', name: 'Zomato' },
            { symbol: 'PAYTM.NS', name: 'Paytm' },
            { symbol: 'NYKAA.NS', name: 'FSN E-Commerce' },
            { symbol: 'POLICYBZR.NS', name: 'PB Fintech' },
            { symbol: 'DELHIVERY.NS', name: 'Delhivery' },
            { symbol: 'INFOEDGE.NS', name: 'Info Edge India' },
            { symbol: 'JUSTDIAL.NS', name: 'Just Dial' },
            { symbol: 'INDIAMART.NS', name: 'IndiaMART InterMESH' },
        ],
    },
    {
        id: 'sector-media',
        name: 'Media & Entertainment',
        description: 'Media, Entertainment and Broadcasting',
        stocks: [
            { symbol: 'SUNTV.NS', name: 'Sun TV Network' },
            { symbol: 'ZEEL.NS', name: 'Zee Entertainment' },
            { symbol: 'PVR.NS', name: 'PVR INOX' },
            { symbol: 'NETWORK18.NS', name: 'Network18 Media' },
            { symbol: 'TV18BRDCST.NS', name: 'TV18 Broadcast' },
            { symbol: 'SAREGAMA.NS', name: 'Saregama India' },
        ],
    },
    {
        id: 'sector-defence',
        name: 'Defence',
        description: 'Defence and Aerospace Companies',
        stocks: [
            { symbol: 'HAL.NS', name: 'Hindustan Aeronautics' },
            { symbol: 'BEL.NS', name: 'Bharat Electronics' },
            { symbol: 'BEML.NS', name: 'BEML' },
            { symbol: 'BDL.NS', name: 'Bharat Dynamics' },
            { symbol: 'MAZAGON.NS', name: 'Mazagon Dock' },
            { symbol: 'COCHINSHIP.NS', name: 'Cochin Shipyard' },
            { symbol: 'GRSE.NS', name: 'Garden Reach Shipbuilders' },
        ],
    },
    {
        id: 'sector-aviation',
        name: 'Aviation & Logistics',
        description: 'Airlines and Logistics Companies',
        stocks: [
            { symbol: 'INDIGO.NS', name: 'InterGlobe Aviation' },
            { symbol: 'SPICEJET.NS', name: 'SpiceJet' },
            { symbol: 'BLUEDART.NS', name: 'Blue Dart Express' },
            { symbol: 'CONTAINER.NS', name: 'Container Corporation' },
            { symbol: 'ALLCARGO.NS', name: 'Allcargo Logistics' },
            { symbol: 'TCI.NS', name: 'Transport Corporation' },
        ],
    },
    {
        id: 'sector-textile',
        name: 'Textiles & Apparel',
        description: 'Textile and Apparel Manufacturing',
        stocks: [
            { symbol: 'RAYMOND.NS', name: 'Raymond' },
            { symbol: 'ARVIND.NS', name: 'Arvind' },
            { symbol: 'WELSPUNIND.NS', name: 'Welspun India' },
            { symbol: 'TRIDENT.NS', name: 'Trident' },
            { symbol: 'PAGEIND.NS', name: 'Page Industries' },
        ],
    },
    {
        id: 'sector-hotels',
        name: 'Hotels & Tourism',
        description: 'Hospitality, Hotels and Tourism',
        stocks: [
            { symbol: 'INDHOTEL.NS', name: 'Indian Hotels' },
            { symbol: 'LEMONTREE.NS', name: 'Lemon Tree Hotels' },
            { symbol: 'CHALET.NS', name: 'Chalet Hotels' },
            { symbol: 'EIHOTEL.NS', name: 'EIH' },
        ],
    },
    {
        id: 'sector-agri',
        name: 'Agriculture & Fertilizers',
        description: 'Agricultural and Fertilizer Companies',
        stocks: [
            { symbol: 'UPL.NS', name: 'UPL' },
            { symbol: 'PIIND.NS', name: 'PI Industries' },
            { symbol: 'COROMANDEL.NS', name: 'Coromandel International' },
            { symbol: 'GNFC.NS', name: 'GNFC' },
            { symbol: 'RCF.NS', name: 'Rashtriya Chemicals & Fertilizers' },
            { symbol: 'CHAMBAL.NS', name: 'Chambal Fertilisers' },
        ],
    },
]

// Helper to get all unique stocks across sectors
export function getAllStocks() {
    const stocksMap = new Map<string, { symbol: string; name: string }>()
    SECTORS_DATA.forEach((sector) => {
        sector.stocks.forEach((stock) => {
            stocksMap.set(stock.symbol, stock)
        })
    })
    return Array.from(stocksMap.values())
}

// Helper to get sector by ID
export function getSectorById(id: string) {
    return SECTORS_DATA.find((sector) => sector.id === id)
}

// Helper to get sector by name
export function getSectorByName(name: string) {
    return SECTORS_DATA.find(
        (sector) => sector.name.toLowerCase() === name.toLowerCase()
    )
}

// Helper to get stocks by sector
export function getStocksBySector(sectorIdOrName: string) {
    const sector =
        getSectorById(sectorIdOrName) || getSectorByName(sectorIdOrName)
    return sector?.stocks || []
}
