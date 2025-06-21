import { NextResponse } from 'next/server';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchStockData(symbol: string, range: string, interval: string) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}&includePrePost=false`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    // Add retry logic
    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Fetch both intraday and long-term data
        const [intradayData, longTermData] = await Promise.all([
          fetchStockData(symbol, '1d', '5m'),
          fetchStockData(symbol, '6mo', '1d')
        ]);

        // Validate the response data
        if (!intradayData.chart?.result?.[0] || !longTermData.chart?.result?.[0]) {
          throw new Error('Invalid data structure received');
        }

        // Add a small delay to prevent rate limiting
        await delay(100);

        return NextResponse.json({
          intraday: intradayData.chart.result[0],
          longTerm: longTermData.chart.result[0]
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (error) {
        lastError = error;
        // Wait before retrying (exponential backoff)
        await delay(Math.pow(2, i) * 1000);
        continue;
      }
    }

    console.error('Error fetching stock data after retries:', lastError);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock data', 
        details: lastError instanceof Error ? lastError.message : 'Unknown error'
      },
      { status: 502 }
    );
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
