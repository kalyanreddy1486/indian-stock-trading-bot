"use client";

import React from 'react';
import TradingBotDashboard from '@/components/TradingBot/TradingBotDashboard';

export default function TradingBotPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 sm:py-16 lg:py-20 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Indian Stock Trading Bot
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time analysis and automated trading signals for NSE stocks
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Trading Bot Dashboard */}
          <TradingBotDashboard />

          {/* Disclaimer */}
          <div className="rounded-lg bg-yellow-50 p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                ⚠️
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Disclaimer
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a demo trading bot for educational purposes only. 
                    Do not use for actual trading decisions. Always conduct your own research 
                    and consult with a licensed financial advisor before making investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Indian Stock Trading Bot. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
