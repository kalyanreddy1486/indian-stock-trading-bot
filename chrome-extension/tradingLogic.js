// Trading Logic Functions
function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period) return 0;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < period; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      avgGain = (avgGain * (period - 1) + difference) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - difference) / period;
    }
  }

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateVWAP(prices, volumes) {
  if (!prices || !volumes || prices.length === 0) return 0;

  let sumPV = 0;
  let sumV = 0;

  for (let i = 0; i < prices.length; i++) {
    sumPV += prices[i] * volumes[i];
    sumV += volumes[i];
  }

  return sumPV / sumV;
}

function calculateEMA(prices, period) {
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

function calculateMACD(prices) {
  if (!prices || prices.length < 26) {
    return { macdLine: 0, signalLine: 0 };
  }

  const ema12Values = [];
  const ema26Values = [];
  const macdValues = [];
  
  let ema12 = prices[0];
  let ema26 = prices[0];
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] !== null && !isNaN(prices[i])) {
      ema12 = prices[i] * k12 + ema12 * (1 - k12);
      ema26 = prices[i] * k26 + ema26 * (1 - k26);
      
      if (i >= 25) {
        const macd = ema12 - ema26;
        macdValues.push(macd);
      }
    }
  }
  
  const signalLine = calculateEMA(macdValues, 9);
  const macdLine = macdValues[macdValues.length - 1];
  
  return { macdLine, signalLine };
}

function computeIntradaySignal(data) {
  const reasons = [];
  let signalType = 'HOLD';

  // BUY conditions
  if (
    data.rsi < 35 &&
    data.price > data.vwap &&
    data.volume > data.averageVolume5Min * 1.8 &&
    data.ema9 > data.ema21
  ) {
    signalType = 'BUY';
    reasons.push(
      'RSI oversold',
      'Price above VWAP',
      'Volume spike detected',
      'Short-term trend bullish'
    );
  }
  // SELL conditions
  else if (
    data.rsi > 65 ||
    data.price < data.vwap ||
    data.ema9 < data.ema21
  ) {
    signalType = 'SELL';
    if (data.rsi > 65) reasons.push('RSI overbought');
    if (data.price < data.vwap) reasons.push('Price below VWAP');
    if (data.ema9 < data.ema21) reasons.push('Short-term trend bearish');
  }

  return { signalType, reasons };
}

function computeLongTermSignal(data) {
  const reasons = [];
  let signalType = 'HOLD';

  const emaDiff = ((data.ema50 - data.ema200) / data.ema200) * 100;
  const macdDiff = data.macdLine - data.macdSignal;
  
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
  else {
    if (Math.abs(emaDiff) < 1) {
      reasons.push('EMAs in consolidation phase');
    }
    if (Math.abs(macdDiff) < 0.1) {
      reasons.push('MACD showing sideways movement');
    }
    reasons.push('Neutral trend - await clear signal');
  }

  return { signalType, reasons };
}

// Export functions for use in popup.js
window.TradingBot = {
  calculateRSI,
  calculateVWAP,
  calculateEMA,
  calculateMACD,
  computeIntradaySignal,
  computeLongTermSignal
};
