"use client";

import React, { useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Signal } from '@/lib/tradingLogic';

export interface AlertData {
  id: string;
  message: string;
  type: 'BUY' | 'SELL' | 'INFO';
  signal?: Signal;
  timestamp: Date;
}

interface AlertsProps {
  alerts: AlertData[];
  onDismiss: (id: string) => void;
}

const Alerts: React.FC<AlertsProps> = ({ alerts, onDismiss }) => {
  useEffect(() => {
    // Auto-dismiss alerts after 30 seconds
    alerts.forEach(alert => {
      setTimeout(() => onDismiss(alert.id), 30000);
    });
  }, [alerts, onDismiss]);

  const getAlertStyle = (type: AlertData['type']) => {
    switch (type) {
      case 'BUY':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'SELL':
        return 'border-l-4 border-red-500 bg-red-50';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md w-full">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id}
          className={`${getAlertStyle(alert.type)} shadow-lg transition-all duration-300 ease-in-out`}
        >
          <AlertDescription>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">
                  {alert.type === 'BUY' && '🟢 '}
                  {alert.type === 'SELL' && '🔴 '}
                  {alert.type === 'INFO' && 'ℹ️ '}
                  {alert.message}
                </p>
                {alert.signal && alert.signal.signalType !== 'HOLD' && (
                  <div className="mt-2 text-sm space-y-1.5">
                    <p className="font-medium">
                      Entry: ₹{alert.signal.entryPrice.toFixed(2)}
                    </p>
                    {alert.signal.target && (
                      <p className="text-green-600">
                        Target: ₹{alert.signal.target.toFixed(2)}
                        {` (${((alert.signal.target / alert.signal.entryPrice - 1) * 100).toFixed(2)}%)`}
                      </p>
                    )}
                    {alert.signal.stopLoss && (
                      <p className="text-red-600">
                        Stop Loss: ₹{alert.signal.stopLoss.toFixed(2)}
                        {` (${((alert.signal.stopLoss / alert.signal.entryPrice - 1) * 100).toFixed(2)}%)`}
                      </p>
                    )}
                    {alert.signal.reason.length > 0 && (
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <p className="font-medium mb-1">Signals:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                          {alert.signal.reason.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default Alerts;
