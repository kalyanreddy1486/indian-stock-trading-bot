"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PriceTicker from './PriceTicker';
import Alerts, { AlertData } from './Alerts';
import IntradayChart from './IntradayChart';
import LongTermChart from './LongTermChart';
import {
  fetchStockData,
  StockData,
  isIntradayActive,
  computeIntradaySignal,
  computeLongTermSignal,
  Signal
} from '@/lib/tradingLogic';

interface ChartData {
  intraday: {
    timestamps: string[];
    prices: number[];
    vwap: number[];
    ema9: number[];
    ema21: number[];
  };
  longTerm: {
    dates: string[];
    prices: number[];
    ema50: number[];
    ema200: number[];
    macd: number[];
    macdSignal: number[];
  };
}

const TradingBotDashboard: React.FC = () => {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [inputSymbol, setInputSymbol] = useState('RELIANCE.NS');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isIntraday, setIsIntraday] = useState(isIntradayActive());
  const [lastSignal, setLastSignal] = useState<Signal | null>(null);

  // Function to create dummy chart data (replace with real data in production)
  const createDummyChartData = (stockData: StockData): ChartData => {
    const now = new Date();
    const basePrice = stockData?.price || 1000;
    
    // Generate timestamps for the last 78 5-minute intervals (6.5 hours)
    const timestamps = Array.from({ length: 78 }, (_, i) => {
      const time = new Date(now.getTime() - (77 - i) * 5 * 60000);
      return time.toLocaleTimeString('en-US', { hour12: false });
    });

    // Generate dates for the last 100 days
    const dates = Array.from({ length: 100 }, (_, i) => {
      const date = new Date(now.getTime() - (99 - i) * 24 * 60 * 60000);
      return date.toLocaleDateString();
    });

    // Create a more realistic price movement pattern
    const generatePrices = (length: number, volatility: number) => {
      let price = basePrice;
      return Array(length).fill(0).map(() => {
        // Random walk with mean reversion
        const change = (Math.random() - 0.5) * volatility;
        price += change;
        // Mean reversion
        price = price * 0.99 + basePrice * 0.01;
        return price;
      });
    };

    // Generate intraday data
    const intradayPrices = generatePrices(78, 2);
    const vwap = intradayPrices.map((p, i) => {
      const slice = intradayPrices.slice(0, i + 1);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });

    // Calculate EMAs
    const calculateEMA = (prices: number[], period: number) => {
      const k = 2 / (period + 1);
      let ema = prices[0];
      return prices.map(price => {
        ema = price * k + ema * (1 - k);
        return ema;
      });
    };

    // Generate long-term data
    const dailyPrices = generatePrices(100, 5);
    const ema50 = calculateEMA(dailyPrices, 50);
    const ema200 = calculateEMA(dailyPrices, 200);

    // Calculate MACD
    const ema12 = calculateEMA(dailyPrices, 12);
    const ema26 = calculateEMA(dailyPrices, 26);
    const macd = ema12.map((e12, i) => e12 - ema26[i]);
    const macdSignal = calculateEMA(macd, 9);

    return {
      intraday: {
        timestamps,
        prices: intradayPrices,
        vwap,
        ema9: calculateEMA(intradayPrices, 9),
        ema21: calculateEMA(intradayPrices, 21),
      },
      longTerm: {
        dates,
        prices: dailyPrices,
        ema50,
        ema200,
        macd,
        macdSignal,
      },
    };
  };

  const addAlert = (message: string, type: AlertData['type'], signal?: Signal) => {
    const newAlert: AlertData = {
      id: Date.now().toString(),
      message,
      type,
      signal,
      timestamp: new Date(),
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const loadData = useCallback(async () => {
    try {
      const data = await fetchStockData(symbol);
      setStockData(data);
      setChartData(createDummyChartData(data));

      // Compute trading signals
      const signal = isIntraday ? computeIntradaySignal(data) : computeLongTermSignal(data);

      // Only create alert if signal is different from last signal
      if (signal.signalType !== 'HOLD' && 
          (!lastSignal || lastSignal.signalType !== signal.signalType)) {
        addAlert(
          `${signal.signalType} Signal for ${symbol}`,
          signal.signalType as 'BUY' | 'SELL',
          signal
        );
        setLastSignal(signal);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      addAlert('Failed to fetch stock data', 'INFO');
    }
  }, [symbol, isIntraday, lastSignal]);

  // Check market status every minute
  useEffect(() => {
    const checkMarketStatus = () => {
      setIsIntraday(isIntradayActive());
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load data at intervals
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, isIntraday ? 300000 : 3600000); // 5min or 1hour
    return () => clearInterval(interval);
  }, [loadData, isIntraday]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Indian Stock Trading Bot</h1>
          <Badge variant={isIntraday ? "default" : "secondary"}>
            {isIntraday ? "Intraday Active" : "Market Closed"}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., RELIANCE.NS, TCS.NS)"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => {
                  setSymbol(inputSymbol);
                  loadData();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                variant="outline"
                size="sm"
              >
                Load
              </Button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Add .NS suffix for NSE stocks (e.g., INFY.NS, WIPRO.NS)
            </p>
          </div>
        </div>
      </div>

      {/* Price Display and Ticker */}
      <div className="grid gap-6 md:grid-cols-2">
        {stockData && (
          <Card className="p-6 bg-white">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{symbol}</h3>
                <Badge variant="outline">NSE</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${
                  stockData.previousClose
                    ? stockData.price > stockData.previousClose
                      ? 'text-green-600'
                      : stockData.price < stockData.previousClose
                      ? 'text-red-600'
                      : 'text-gray-900'
                    : 'text-gray-900'
                }`}>
                  ₹{stockData.price.toFixed(2)}
                </span>
                {stockData.previousClose && (
                  <span className={`text-sm font-medium ${
                    stockData.price > stockData.previousClose 
                      ? 'text-green-600' 
                      : stockData.price < stockData.previousClose
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {((stockData.price - stockData.previousClose) / stockData.previousClose * 100).toFixed(2)}%
                  </span>
                )}
              </div>
              {stockData.previousClose && (
                <div className="text-sm text-gray-500">
                  Previous Close: ₹{stockData.previousClose.toFixed(2)}
                </div>
              )}
            </div>
          </Card>
        )}
        <PriceTicker 
          symbol={symbol} 
          refreshInterval={isIntraday ? 60000 : 300000}
        />
      </div>

      {/* Trading Signals */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Intraday Signal */}
        <Card className={`p-6 ${!isIntraday ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Intraday Signal</h3>
              <Badge variant={isIntraday ? "default" : "secondary"}>
                {isIntraday ? "Active" : "Market Closed"}
              </Badge>
            </div>
            {stockData && (
              <div className="space-y-2">
                {!isIntraday ? (
                  <p className="text-gray-600">
                    Market is closed. Intraday signals will resume at 9:15 AM.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {computeIntradaySignal(stockData).signalType === 'BUY' && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          🟢 BUY
                        </Badge>
                      )}
                      {computeIntradaySignal(stockData).signalType === 'SELL' && (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          🔴 SELL
                        </Badge>
                      )}
                      {computeIntradaySignal(stockData).signalType === 'HOLD' && (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          ⚪ HOLD
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>RSI: {stockData.rsi.toFixed(2)}</p>
                      <p>VWAP: ₹{stockData.vwap.toFixed(2)}</p>
                      <p>Volume: {stockData.volume.toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Long Term Signal */}
        <Card className="p-6 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Long Term Signal</h3>
              <Badge variant="outline">Daily Chart</Badge>
            </div>
            {stockData && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {computeLongTermSignal(stockData).signalType === 'BUY' && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      🟢 BUY
                    </Badge>
                  )}
                  {computeLongTermSignal(stockData).signalType === 'SELL' && (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      🔴 SELL
                    </Badge>
                  )}
                  {computeLongTermSignal(stockData).signalType === 'HOLD' && (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                      ⚪ HOLD
                    </Badge>
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <p>50 EMA: ₹{stockData.ema50.toFixed(2)}</p>
                  <p>200 EMA: ₹{stockData.ema200.toFixed(2)}</p>
                  <p>MACD: {stockData.macdLine.toFixed(3)}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {isIntraday ? (
          chartData && <IntradayChart data={chartData.intraday} />
        ) : (
          chartData && <LongTermChart data={chartData.longTerm} />
        )}
      </div>

      {/* Manual Scan Button */}
      {isIntraday && (
        <Button 
          onClick={loadData}
          className="w-full"
          variant="outline"
        >
          Run 5-min Scan
        </Button>
      )}

      {/* Alerts */}
      <Alerts alerts={alerts} onDismiss={removeAlert} />
    </div>
  );
};

export default TradingBotDashboard;
