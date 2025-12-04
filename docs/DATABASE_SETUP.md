# NSE Live Stocks - Database Setup Guide

## Database Schema Overview

The application uses PostgreSQL with Prisma ORM. Here's an overview of all the data models:

### User & Authentication

| Model | Purpose |
|-------|---------|
| **User** | Core user account with Telegram authentication |
| **Session** | Active login sessions with device tracking |
| **NotificationSettings** | User preferences for alerts and notifications |

### Stock Tracking

| Model | Purpose |
|-------|---------|
| **Watchlist** | User's saved stocks for quick access |
| **Portfolio** | User's investment portfolios |
| **PortfolioHolding** | Individual stock holdings within portfolios |

### Alerts

| Model | Purpose |
|-------|---------|
| **Alert** | Active price alerts set by users |
| **AlertHistory** | Record of all triggered alerts |

### Search & Activity

| Model | Purpose |
|-------|---------|
| **SearchHistory** | User's search history for quick access |
| **ActivityLog** | Comprehensive activity logging for analytics |

### Market Data

| Model | Purpose |
|-------|---------|
| **Sector** | Market sectors (IT, Banking, Pharma, etc.) |
| **Stock** | Master stock data with sector mapping |
| **StockPrice** | Historical price data |
| **MarketIndex** | Major indices (NIFTY 50, SENSEX, BANK NIFTY) |

---

## Database Setup

### Prerequisites

1. PostgreSQL database (local or cloud-hosted)
2. Node.js 18+ installed
3. npm or yarn package manager

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE nse_db;
   ```
3. Update your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/nse_db?schema=public"
   ```

### Option 2: Cloud Database (Recommended for Production)

#### Supabase (Free tier available)
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the URI and add to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

#### Neon (Free tier available)
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require"
   ```

#### Railway
1. Create account at [railway.app](https://railway.app)
2. Add PostgreSQL plugin
3. Copy the connection string to `.env`

---

## Database Migration

### Initial Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Or create migration (production recommended)
npx prisma migrate dev --name init
```

### View Database

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Reset Database

```bash
# Reset and reseed (CAUTION: Deletes all data!)
npx prisma migrate reset
```

---

## API Endpoints

### Search History
- `GET /api/search-history` - Get user's search history
- `POST /api/search-history` - Add new search
- `DELETE /api/search-history` - Clear all search history

### Portfolio
- `GET /api/portfolio` - Get all portfolios
- `POST /api/portfolio` - Create new portfolio
- `GET /api/portfolio/[id]/holdings` - Get portfolio holdings
- `POST /api/portfolio/[id]/holdings` - Add holding
- `DELETE /api/portfolio/[id]/holdings?symbol=XXX` - Remove holding

### Watchlist
- `GET /api/watchlist` - Get watchlist with live prices
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist?symbol=XXX` - Remove from watchlist

### Notification Settings
- `GET /api/user/notifications` - Get settings
- `PUT /api/user/notifications` - Update settings

---

## Data Flow

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Next.js   │────▶│  PostgreSQL  │
│   (React)    │◀────│   API       │◀────│   (Prisma)   │
└──────────────┘     └─────────────┘     └──────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │Yahoo Finance│
                     │    API      │
                     └─────────────┘
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | Secret for JWT token signing | ✅ Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot API token | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Optional |

---

## Troubleshooting

### "EPERM: operation not permitted" on Windows
- Stop all Node.js processes
- Close any terminals/editors accessing the project
- Run `npx prisma generate` again

### "Cannot connect to database"
- Verify DATABASE_URL format
- Check if database server is running
- Ensure network access (firewall, VPN)

### "Table does not exist"
- Run `npx prisma db push` to sync schema
- Or run `npx prisma migrate dev`

---

## Seeding Data

The project includes a seed file for initial data:

```bash
npx prisma db seed
```

This populates:
- Sectors (IT, Banking, Pharma, etc.)
- Initial stock list
- Sample market indices
