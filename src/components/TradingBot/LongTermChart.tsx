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

interface LongTermChartProps {
  data: {
    dates: string[];
    prices: number[];
    ema50: number[];
    ema200: number[];
    macd: number[];
    macdSignal: number[];
  };
}

const LongTermChart: React.FC<LongTermChartProps> = ({ data }) => {
  const chartData: ChartData<'line'> = {
    labels: data.dates,
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
        yAxisID: 'y',
      },
      {
        label: '50 EMA',
        data: data.ema50,
        borderColor: '#10b981', // Emerald
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y',
      },
      {
        label: '200 EMA',
        data: data.ema200,
        borderColor: '#ef4444', // Red
        backgroundColor: 'transparent',
        borderDash: [3, 3],
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'MACD',
        data: data.macd,
        borderColor: '#8b5cf6', // Purple
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y1',
      },
      {
        label: 'Signal Line',
        data: data.macdSignal,
        borderColor: '#f59e0b', // Amber
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y1',
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
        text: 'Long Term Analysis (Daily)',
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (context.datasetIndex <= 2) { // Price and EMAs
              return `${label}: ₹${value.toFixed(2)}`;
            } else { // MACD and Signal
              return `${label}: ${value.toFixed(3)}`;
            }
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
          maxTicksLimit: 10,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Price',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
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
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'MACD',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
        ticks: {
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

export default LongTermChart;
