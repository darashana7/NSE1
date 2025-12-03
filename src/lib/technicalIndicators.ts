import {
  SMA,
  EMA,
  RSI,
  MACD,
  BollingerBands,
} from 'technicalindicators'

export interface ChartDataPoint {
  time: string
  price: number
  open?: number
  high?: number
  low?: number
  close?: number
  volume?: number
}

export interface IndicatorResult {
  sma20?: number[]
  sma50?: number[]
  sma200?: number[]
  ema12?: number[]
  ema26?: number[]
  rsi?: number[]
  macd?: {
    MACD: number[]
    signal: number[]
    histogram: number[]
  }
  bollingerBands?: {
    upper: number[]
    middle: number[]
    lower: number[]
  }
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number[] {
  if (prices.length < period) return []
  
  const sma = SMA.calculate({
    period,
    values: prices,
  })
  
  // Pad the beginning with nulls to match original array length
  const padding = new Array(period - 1).fill(null)
  return [...padding, ...sma]
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return []
  
  const ema = EMA.calculate({
    period,
    values: prices,
  })
  
  const padding = new Array(period - 1).fill(null)
  return [...padding, ...ema]
}

/**
 * Calculate Relative Strength Index
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return []
  
  const rsi = RSI.calculate({
    period,
    values: prices,
  })
  
  const padding = new Array(period).fill(null)
  return [...padding, ...rsi]
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { MACD: number[]; signal: number[]; histogram: number[] } | null {
  if (prices.length < slowPeriod + signalPeriod) return null
  
  const macdData = MACD.calculate({
    values: prices,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  })
  
  const padding = slowPeriod + signalPeriod - 1
  const nullPadding = new Array(padding).fill(null)
  
  return {
    MACD: [...nullPadding, ...macdData.map(d => d.MACD)],
    signal: [...nullPadding, ...macdData.map(d => d.signal)],
    histogram: [...nullPadding, ...macdData.map(d => d.histogram)],
  }
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } | null {
  if (prices.length < period) return null
  
  const bbData = BollingerBands.calculate({
    period,
    values: prices,
    stdDev,
  })
  
  const padding = new Array(period - 1).fill(null)
  
  return {
    upper: [...padding, ...bbData.map(d => d.upper)],
    middle: [...padding, ...bbData.map(d => d.middle)],
    lower: [...padding, ...bbData.map(d => d.lower)],
  }
}

/**
 * Calculate all indicators for a given dataset
 */
export function calculateAllIndicators(
  chartData: ChartDataPoint[]
): IndicatorResult {
  const prices = chartData.map(d => d.price || d.close || 0)
  
  if (prices.length < 200) {
    // Not enough data for all indicators
    return {
      sma20: calculateSMA(prices, 20),
      sma50: calculateSMA(prices, 50),
      ema12: calculateEMA(prices, 12),
      ema26: calculateEMA(prices, 26),
      rsi: calculateRSI(prices, 14),
      macd: calculateMACD(prices) || undefined,
      bollingerBands: calculateBollingerBands(prices) || undefined,
    }
  }
  
  return {
    sma20: calculateSMA(prices, 20),
    sma50: calculateSMA(prices, 50),
    sma200: calculateSMA(prices, 200),
    ema12: calculateEMA(prices, 12),
    ema26: calculateEMA(prices, 26),
    rsi: calculateRSI(prices, 14),
    macd: calculateMACD(prices) || undefined,
    bollingerBands: calculateBollingerBands(prices) || undefined,
  }
}

/**
 * Format indicator data for recharts
 */
export function mergeIndicatorsWithChartData(
  chartData: ChartDataPoint[],
  indicators: IndicatorResult
): any[] {
  return chartData.map((point, index) => ({
    ...point,
    sma20: indicators.sma20?.[index] ?? null,
    sma50: indicators.sma50?.[index] ?? null,
    sma200: indicators.sma200?.[index] ?? null,
    ema12: indicators.ema12?.[index] ?? null,
    ema26: indicators.ema26?.[index] ?? null,
    rsi: indicators.rsi?.[index] ?? null,
    macd: indicators.macd?.MACD[index] ?? null,
    macdSignal: indicators.macd?.signal[index] ?? null,
    macdHistogram: indicators.macd?.histogram[index] ?? null,
    bbUpper: indicators.bollingerBands?.upper[index] ?? null,
    bbMiddle: indicators.bollingerBands?.middle[index] ?? null,
    bbLower: indicators.bollingerBands?.lower[index] ?? null,
  }))
}
