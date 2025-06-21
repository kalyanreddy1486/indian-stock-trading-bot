"use client";

import React, { useEffect, useState } from 'react';
import { fetchStockData, StockData } from '@/lib/tradingLogic';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface PriceTickerProps {
  symbol: string;
  refreshInterval?: number; // in milliseconds
}

const PriceTicker: React.FC<PriceTickerProps> = ({ 
  symbol, 
  refreshInterval = 60000 // default 1 minute
}) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStockData(symbol);
      setStockData(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, refreshInterval]);

  const getPriceChangeColor = () => {
    if (!stockData?.previousClose) return 'text-gray-500';
    return stockData.price > stockData.previousClose ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className="p-4 bg-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{symbol}</h3>
            <Badge variant="secondary" className="text-xs">
              {isLoading ? 'Updating...' : 'Live'}
            </Badge>
          </div>
          {error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${getPriceChangeColor()}`}>
                ₹{stockData?.price.toFixed(2) || '---'}
              </span>
              {stockData?.previousClose && (
                <span className="text-sm text-gray-500">
                  Prev: ₹{stockData.previousClose.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={loadData}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          disabled={isLoading}
        >
          ↻
        </button>
      </div>
    </Card>
  );
};

export default PriceTicker;
