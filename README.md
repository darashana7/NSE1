# NSE Live Stocks Dashboard

A comprehensive real-time stock market dashboard for NSE (National Stock Exchange of India) built with Next.js 15, TypeScript, and Tailwind CSS, integrated with **real Yahoo Finance data**.

## Features

### 🔄 Real-time Data
- **Live stock prices** from Yahoo Finance API
- Real-time updates every 30 seconds
- Interactive price charts with historical data
- Market overview indicators
- Auto-refresh functionality

### 📊 Stock Information
- **Current Price**: Real-time stock prices
- **Day Change**: Price movement with percentage
- **Volume**: Trading volume information
- **Market Cap**: Company market capitalization
- **52 Week High/Low**: Annual price range
- **P/E Ratio**: Price-to-earnings ratio
- **EPS**: Earnings per share
- **Dividend**: Dividend yield

### 🔍 Search & Discovery
- **Comprehensive Search**: Search 200+ NSE stocks by symbol or company name
- **Fuzzy Matching**: Intelligent partial name matching (e.g., "tata" finds all Tata companies)
- **Yahoo Finance Integration**: Direct search for stocks not in local database
- **Real-time Data**: Live prices for all search results
- **Smart Scoring**: Prioritizes exact symbol matches over name matches
- **Trending Stocks**: Section with real data from popular NSE stocks
- **Popular NSE Stocks**: Quick access to most traded companies

### ⭐ Watchlist
- Add/remove stocks from personal watchlist
- Persistent watchlist across sessions
- Quick access to tracked stocks
- Live price updates for watchlist items

### 📈 Interactive Charts
- **Multiple Time Periods**: 1 Day, 5 Days, 1 Month, 3 Months, 6 Months, 1 Year
- **Beautiful area charts** with gradient fills
- **Smart Data Sampling**: Optimized data points for better performance
- **Real-time Updates**: Charts refresh with live data
- **Responsive design** for all screen sizes
- **Interactive tooltips** with detailed information
- **5-minute intervals** for intraday, daily for longer periods

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Charts**: Recharts
- **Icons**: Lucide React
- **API**: RESTful API routes
- **Data Source**: Yahoo Finance API (real-time data)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nse-live-stocks
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate Prisma client

## API Endpoints

### Stocks
- `GET /api/stocks/trending` - Get trending NSE stocks (real Yahoo Finance data)
- `GET /api/stocks/search?q=query` - Search stocks by name or symbol
- `GET /api/stocks/details?symbol=SYMBOL&period=PERIOD` - Get detailed stock information and chart data
  - **Periods**: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`
  - **Examples**: `?symbol=INFY.NS&period=1mo` or `?symbol=RELIANCE.NS&period=1y`

### Watchlist
- `GET /api/watchlist` - Get user's watchlist with real-time data
- `POST /api/watchlist/toggle` - Add/remove stock from watchlist

## Stock Symbols

The dashboard supports **200+ NSE stocks** with `.NS` suffix:

### Large Cap Stocks
- `RELIANCE.NS` - Reliance Industries
- `TCS.NS` - Tata Consultancy Services
- `HDFCBANK.NS` - HDFC Bank
- `INFY.NS` - Infosys
- `ICICIBANK.NS` - ICICI Bank
- `HINDUNILVR.NS` - Hindustan Unilever
- `SBIN.NS` - State Bank of India
- `BHARTIARTL.NS` - Bharti Airtel
- `KOTAKBANK.NS` - Kotak Mahindra Bank
- `LT.NS` - Larsen & Toubro

### Technology Stocks
- `WIPRO.NS` - Wipro
- `HCLTECH.NS` - HCL Technologies
- `TECHM.NS` - Tech Mahindra
- `MPHASIS.NS` - Mphasis
- `COFORGE.NS` - Coforge
- `PERSISTENT.NS` - Persistent Systems

### Banking & Finance
- `AXISBANK.NS` - Axis Bank
- `PNB.NS` - Punjab National Bank
- `BANKBARODA.NS` - Bank of Baroda
- `CANBK.NS` - Canara Bank
- `FEDERALBNK.NS` - Federal Bank
- `YESBANK.NS` - Yes Bank

### Pharma & Healthcare
- `SUNPHARMA.NS` - Sun Pharma
- `DRREDDY.NS` - Dr Reddy's Laboratories
- `CIPLA.NS` - Cipla
- `LUPIN.NS` - Lupin
- `AUROPHARMA.NS` - Aurobindo Pharma

### Auto & Industrial
- `MARUTI.NS` - Maruti Suzuki
- `TATAMOTORS.NS` - Tata Motors
- `MRF.NS` - MRF
- `APOLLOTYRE.NS` - Apollo Tyres
- `JSWSTEEL.NS` - JSW Steel

### Consumer Goods
- `ITC.NS` - ITC
- `GODREJCP.NS` - Godrej Consumer Products
- `TITAN.NS` - Titan Company
- `NESTLEIND.NS` - Nestle India

### Real Estate & Infrastructure
- `GODREJPROP.NS` - Godrej Properties
- `DLF.NS` - DLF
- `GMRINFRA.NS` - GMR Infrastructure

**And 150+ more stocks across all sectors!**

## Data Source

This application uses **Yahoo Finance API** to fetch real-time stock data:
- **Live Prices**: Current market prices with real-time updates
- **Historical Data**: Intraday price charts with 5-minute intervals
- **Market Statistics**: Volume, market cap, P/E ratios, and more
- **Error Handling**: Automatic fallback to cached data if API is unavailable

## Features in Detail

### Real-time Updates
- Stock prices automatically refresh every 30 seconds
- Manual refresh button available
- Live status indicator
- Smooth animations for price changes
- **Real Yahoo Finance data integration**

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts for tablets and desktops
- Optimized chart rendering

### User Experience
- Loading states and skeletons
- Error handling with fallbacks
- Intuitive navigation
- Accessible design patterns
- **Real data with graceful degradation**

## Error Handling & Reliability

- **API Failures**: Automatic fallback to cached data
- **Network Issues**: Graceful degradation with user notifications
- **Data Validation**: Type-safe data handling
- **Rate Limiting**: Respectful API usage patterns

## Future Enhancements

- [ ] User authentication and persistent watchlists
- [ ] Portfolio tracking with real P&L
- [ ] Stock price alerts and notifications
- [ ] Advanced charting with technical indicators
- [ ] Sector-wise analysis and comparison
- [ ] International market support
- [ ] WebSocket integration for true real-time updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

**Real-time Data**: This application uses Yahoo Finance API for real-time stock data. While we strive for accuracy, there may be delays or discrepancies. For actual stock trading and investment decisions, please use verified financial data sources and consult with financial advisors.

---

**Built with ❤️ using Next.js 15, TypeScript, and real Yahoo Finance data**