# Indian Stock Trading Bot

A real-time trading analysis tool for NSE stocks with intraday and long-term signals.

## Features

### Real-Time Trading Signals

#### Intraday Mode (9:15 AM - 3:30 PM IST)
- 🟢 **BUY Signals** when all conditions are met:
  - RSI < 35
  - Price > VWAP
  - Volume > 1.8× 5-min average
  - EMA(9) > EMA(21)
- 🔴 **SELL Signals** when any condition is met:
  - RSI > 65
  - Price < VWAP
  - EMA(9) < EMA(21)

#### Long-Term Mode (24/7)
- 🟢 **BUY Signals**:
  - 50 EMA > 200 EMA with trend strength %
  - MACD line > Signal line
  - Strong upward trend when difference > 5%
- 🔴 **SELL Signals**:
  - 50 EMA < 200 EMA with trend strength %
  - MACD line < Signal line
  - Strong downward trend when difference < -5%
- ⚪ **HOLD Signals**:
  - EMAs in consolidation (< 1% difference)
  - MACD showing sideways movement

### Technical Analysis
- Real-time price updates
- RSI, VWAP, and Volume analysis
- Multiple EMA crossovers (9, 21, 50, 200)
- MACD with signal line
- Support and resistance levels
- Trend strength indicators

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd indian-stock-trading-bot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:8000 in your browser

### Usage
1. Enter any NSE stock symbol (e.g., RELIANCE.NS, INFY.NS)
2. Click "Load" to analyze the stock
3. View real-time intraday signals during market hours
4. Check long-term analysis available 24/7
5. Monitor technical indicators and price movements
6. Receive automated alerts for trading signals

## Technical Stack
- Next.js 13 with App Router
- TypeScript
- Tailwind CSS
- ShadcnUI Components
- Chart.js for technical analysis
- Yahoo Finance API for real-time data

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer
This tool is for educational and research purposes only. Always conduct your own research and consult with a financial advisor before making investment decisions.
