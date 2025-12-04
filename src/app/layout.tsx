import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NSE Live Stocks - Real-time Indian Stock Market Data",
  description: "Track NSE stocks in real-time with live prices, market indices, watchlists, price alerts, sector analysis, and stock comparison tools.",
  keywords: ["NSE", "stocks", "Indian stock market", "live stocks", "NIFTY 50", "SENSEX", "stock alerts", "market analysis"],
  authors: [{ name: "NSE Live" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "NSE Live Stocks",
    description: "Real-time Indian stock market data and analysis",
    siteName: "NSE Live Stocks",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NSE Live Stocks",
    description: "Real-time Indian stock market data and analysis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

