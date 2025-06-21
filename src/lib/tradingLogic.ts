"use client";

import axios from 'axios';

export interface StockData {
  symbol: string;
  price: number;
  previousClose: number;
  volume: number;
  averageVolume5Min: number;
  rsi: number;
  vwap: number;
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  macdLine: number;
  macdSignal: number;
  supportLevels: number[];
  resistanceLevels: number[];
}

export interface Signal {
  signalType: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  entryPrice: number;
  target?: number;
  stopLoss?: number;
  reason: string[];
}

// Check if market is open for intraday trading (9:15 AM - 3:30 PM, Weekdays)
export function isIntradayActive(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 100 + minutes;

  // Check if it's a weekday (1-5) and between 9:15 AM and 3:30 PM
  return day >= 1 && day <= 5 && currentTime >= 915 && currentTime <= 1530;
}

// Calculate RSI (14-period)
function calculateRSI(prices: number[]): number {
  if (prices.length < 14) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < 14; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  const averageGain = gains / 14;
  const averageLoss = losses / 14;
  const relativeStrength = averageGain / averageLoss;
  return 100 - (100 / (1 + relativeStrength));
}

// Calculate VWAP
function calculateVWAP(prices: number[], volumes: number[]): number {
  const typicalPrices = prices.map(p => p);
  const cumulativeTPV = typicalPrices.reduce((sum, tp, i) => sum + tp * volumes[i], 0);
  const cumulativeVolume = volumes.reduce((sum, vol) => sum + vol, 0);
  return cumulativeTPV / cumulativeVolume;
}

// Calculate EMA
function calculateEMA(prices: number[], period: number): number {
  if (!prices || prices.length === 0) return 0;
  
  const k = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] !== null && !isNaN(prices[i])) {
      ema = prices[i] * k + ema * (1 - k);
    }
  }
  
  return ema;
}

// Calculate MACD
function calculateMACD(prices: number[]) {
  if (!prices || prices.length < 26) {
    return { macdLine: 0, signalLine: 0 };
  }

  const ema12Values = [];
  const ema26Values = [];
  const macdValues = [];
  
  // Calculate EMA12 and EMA26 for each price point
  let ema12 = prices[0];
  let ema26 = prices[0];
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] !== null && !isNaN(prices[i])) {
      ema12 = prices[i] * k12 + ema12 * (1 - k12);
      ema26 = prices[i] * k26 + ema26 * (1 - k26);
      
      if (i >= 25) { // Start calculating MACD after we have enough EMA26 values
        const macd = ema12 - ema26;
        macdValues.push(macd);
      }
    }
  }
  
  // Calculate signal line (9-day EMA of MACD)
  const signalLine = calculateEMA(macdValues, 9);
  const macdLine = macdValues[macdValues.length - 1];
  
  return { macdLine, signalLine };
}

// Calculate Support Levels
function calculateSupportLevels(prices: number[]): number[] {
  const levels: number[] = [];
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
      levels.push(prices[i]);
    }
  }
  return [...new Set(levels)].sort((a: number, b: number) => a - b);
}

// Calculate Resistance Levels
function calculateResistanceLevels(prices: number[]): number[] {
  const levels: number[] = [];
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
      levels.push(prices[i]);
    }
  }
  return [...new Set(levels)].sort((a: number, b: number) => a - b);
}

// Compute intraday trading signal based on specified conditions
export function computeIntradaySignal(data: StockData): Signal {
  const reasons: string[] = [];
  let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

  // BUY conditions (all must be met)
  const buyConditions = [
    { condition: data.rsi < 35, reason: 'RSI below 35' },
    { condition: data.price > data.vwap, reason: 'Price above VWAP' },
    { condition: data.volume > data.averageVolume5Min * 1.8, reason: 'Volume > 1.8× 5-min average' },
    { condition: data.ema9 > data.ema21, reason: 'EMA(9) above EMA(21)' }
  ];

  if (buyConditions.every(({ condition }) => condition)) {
    signalType = 'BUY';
    reasons.push(...buyConditions.map(({ reason }) => reason));
  }

  // SELL conditions (any can trigger)
  const sellConditions = [
    { condition: data.rsi > 65, reason: 'RSI above 65' },
    { condition: data.price < data.vwap, reason: 'Price below VWAP' },
    { condition: data.ema9 < data.ema21, reason: 'EMA(9) below EMA(21)' }
  ];

  const sellTriggered = sellConditions.filter(({ condition }) => condition);
  if (sellTriggered.length > 0) {
    signalType = 'SELL';
    reasons.push(...sellTriggered.map(({ reason }) => reason));
  }

  // Calculate target and stop-loss (0.8% for target, 0.4% for stop-loss)
  const target = signalType === 'BUY' ? data.price * 1.008 : data.price * 0.992;
  const stopLoss = signalType === 'BUY' ? data.price * 0.996 : data.price * 1.004;

  return {
    signalType,
    price: data.price,
    entryPrice: data.price,
    ...(signalType !== 'HOLD' && {
      target: Number(target.toFixed(2)),
      stopLoss: Number(stopLoss.toFixed(2))
    }),
    reason: reasons
  };
}

// Compute long-term trading signal
export function computeLongTermSignal(data: StockData): Signal {
  const reasons: string[] = [];
  let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

  // Calculate trend strength
  const emaDiff = ((data.ema50 - data.ema200) / data.ema200) * 100;
  const macdDiff = data.macdLine - data.macdSignal;
  
  // Strong BUY conditions
  if (data.ema50 > data.ema200 && data.macdLine > data.macdSignal) {
    signalType = 'BUY';
    reasons.push(
      `50 EMA above 200 EMA (${emaDiff.toFixed(2)}% difference)`,
      `MACD bullish (${macdDiff.toFixed(3)} spread)`
    );
    
    if (emaDiff > 5) {
      reasons.push('Strong upward trend');
    }
  }
  // Strong SELL conditions
  else if (data.ema50 < data.ema200 && data.macdLine < data.macdSignal) {
    signalType = 'SELL';
    reasons.push(
      `50 EMA below 200 EMA (${Math.abs(emaDiff).toFixed(2)}% difference)`,
      `MACD bearish (${Math.abs(macdDiff).toFixed(3)} spread)`
    );
    
    if (emaDiff < -5) {
      reasons.push('Strong downward trend');
    }
  }
  // HOLD conditions
  else {
    if (Math.abs(emaDiff) < 1) {
      reasons.push('EMAs in consolidation phase');
    }
    if (Math.abs(macdDiff) < 0.1) {
      reasons.push('MACD showing sideways movement');
    }
    reasons.push('Neutral trend - await clear signal');
  }

  // Add support/resistance info
  if (data.supportLevels.length > 0) {
    const nearestSupport = Math.max(...data.supportLevels.filter(s => s < data.price));
    reasons.push(`Nearest support: ₹${nearestSupport}`);
  }
  if (data.resistanceLevels.length > 0) {
    const nearestResistance = Math.min(...data.resistanceLevels.filter(r => r > data.price));
    reasons.push(`Nearest resistance: ₹${nearestResistance}`);
  }

  // Calculate target and stop-loss (2% for target, 1% for stop-loss in long-term)
  const target = signalType === 'BUY' ? data.price * 1.02 : data.price * 0.98;
  const stopLoss = signalType === 'BUY' ? data.price * 0.99 : data.price * 1.01;

  return {
    signalType,
    price: data.price,
    entryPrice: data.price,
    ...(signalType !== 'HOLD' && {
      target: Number(target.toFixed(2)),
      stopLoss: Number(stopLoss.toFixed(2))
    }),
    reason: reasons
  };
}

// Fetch stock data from Yahoo Finance
export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    const response = await axios.get(`/api/stock?symbol=${symbol}`);
    const intradayData = response.data.intraday;
    const longTermData = response.data.longTerm;
    
    // Get current price and previous close from intraday data
    const price = intradayData.meta.regularMarketPrice;
    const previousClose = intradayData.meta.previousClose;
    
    // Get intraday indicators
    const intradayPrices = intradayData.indicators.quote[0].close;
    const intradayVolumes = intradayData.indicators.quote[0].volume;
    
    // Get long-term indicators
    const longTermPrices = longTermData.indicators.quote[0].close.filter((p: number) => p !== null);
    const longTermVolumes = longTermData.indicators.quote[0].volume.filter((v: number) => v !== null);
    
    return {
      symbol,
      price,
      previousClose,
      volume: intradayVolumes[intradayVolumes.length - 1] || 0,
      averageVolume5Min: intradayVolumes.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5,
      // Intraday indicators
      rsi: calculateRSI(intradayPrices),
      vwap: calculateVWAP(intradayPrices, intradayVolumes),
      ema9: calculateEMA(intradayPrices, 9),
      ema21: calculateEMA(intradayPrices, 21),
      // Long-term indicators
      ema50: calculateEMA(longTermPrices, 50),
      ema200: calculateEMA(longTermPrices, 200),
      macdLine: calculateMACD(longTermPrices).macdLine,
      macdSignal: calculateMACD(longTermPrices).signalLine,
      supportLevels: calculateSupportLevels(longTermPrices),
      resistanceLevels: calculateResistanceLevels(longTermPrices)
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}
