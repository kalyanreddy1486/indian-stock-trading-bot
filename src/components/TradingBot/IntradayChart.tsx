"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IntradayChartProps {
  data: {
    timestamps: string[];
    prices: number[];
    vwap: number[];
    ema9: number[];
    ema21: number[];
  };
}

const IntradayChart: React.FC<IntradayChartProps> = ({ data }) => {
  const chartData: ChartData<'line'> = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Price',
        data: data.prices,
        borderColor: '#2563eb', // Blue
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'VWAP',
        data: data.vwap,
        borderColor: '#f59e0b', // Amber
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'EMA9',
        data: data.ema9,
        borderColor: '#10b981', // Emerald
        backgroundColor: 'transparent',
        borderDash: [3, 3],
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'EMA21',
        data: data.ema21,
        borderColor: '#ef4444', // Red
        backgroundColor: 'transparent',
        borderDash: [2, 2],
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: 'Intraday Chart (5-min)',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold',
        },
        padding: { bottom: 20 },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => `₹${value}`,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
        },
      },
    },
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="h-[400px]">
        <Line options={options} data={chartData} />
      </div>
    </Card>
  );
};

export default IntradayChart;
