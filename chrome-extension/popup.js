document.addEventListener('DOMContentLoaded', () => {
  const stockSymbol = document.getElementById('stockSymbol');
  const loadButton = document.getElementById('loadStock');
  const priceCard = document.getElementById('priceCard');
  const stockName = document.getElementById('stockName');
  const price = document.getElementById('price');
  const change = document.getElementById('change');
  const intradayStatus = document.getElementById('intradayStatus');
  const intradayIndicators = document.getElementById('intradayIndicators');
  const longTermStatus = document.getElementById('longTermStatus');
  const longTermIndicators = document.getElementById('longTermIndicators');

  let stockData = null;
  let updateInterval = null;

  async function fetchStockData(symbol) {
    try {
      // Fetch intraday data
      const intradayResponse = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`
      );
      const intradayData = await intradayResponse.json();

      // Fetch long-term data
      const longTermResponse = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=6mo&interval=1d`
      );
      const longTermData = await longTermResponse.json();

      if (!intradayData.chart?.result?.[0] || !longTermData.chart?.result?.[0]) {
        throw new Error('Invalid data received');
      }

      const intraday = intradayData.chart.result[0];
      const longTerm = longTermData.chart.result[0];

      const currentPrice = intraday.meta.regularMarketPrice;
      const previousClose = intraday.meta.previousClose;
      const intradayPrices = intraday.indicators.quote[0].close;
      const intradayVolumes = intraday.indicators.quote[0].volume;
      const longTermPrices = longTerm.indicators.quote[0].close.filter(p => p !== null);

      stockData = {
        symbol,
        price: currentPrice,
        previousClose,
        volume: intradayVolumes[intradayVolumes.length - 1],
        averageVolume5Min: intradayVolumes.slice(-5).reduce((a, b) => a + b, 0) / 5,
        rsi: window.TradingBot.calculateRSI(intradayPrices),
        vwap: window.TradingBot.calculateVWAP(intradayPrices, intradayVolumes),
        ema9: window.TradingBot.calculateEMA(intradayPrices, 9),
        ema21: window.TradingBot.calculateEMA(intradayPrices, 21),
        ema50: window.TradingBot.calculateEMA(longTermPrices, 50),
        ema200: window.TradingBot.calculateEMA(longTermPrices, 200),
        ...window.TradingBot.calculateMACD(longTermPrices)
      };

      updateUI();
    } catch (error) {
      console.error('Error fetching stock data:', error);
      showError('Failed to fetch stock data. Please try again.');
    }
  }

  function updateUI() {
    if (!stockData) return;

    // Update price card
    priceCard.classList.remove('hidden');
    stockName.textContent = stockData.symbol;
    price.textContent = `₹${stockData.price.toFixed(2)}`;
    
    const changeValue = stockData.price - stockData.previousClose;
    const changePercent = (changeValue / stockData.previousClose) * 100;
    change.textContent = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)} (${changePercent.toFixed(2)}%)`;
    change.className = `text-sm ${changeValue >= 0 ? 'text-green-600' : 'text-red-600'}`;

    // Update intraday signals
    const intradaySignal = window.TradingBot.computeIntradaySignal(stockData);
    intradayStatus.textContent = `Signal: ${intradaySignal.signalType}`;
    intradayStatus.className = `text-sm font-medium ${
      intradaySignal.signalType === 'BUY' ? 'text-green-600' :
      intradaySignal.signalType === 'SELL' ? 'text-red-600' :
      'text-gray-600'
    }`;
    
    intradayIndicators.innerHTML = `
      <p>RSI: ${stockData.rsi.toFixed(2)}</p>
      <p>VWAP: ₹${stockData.vwap.toFixed(2)}</p>
      <p>Volume: ${stockData.volume.toLocaleString()}</p>
      <p>EMA9/21: ${stockData.ema9.toFixed(2)}/${stockData.ema21.toFixed(2)}</p>
      ${intradaySignal.reasons.map(reason => `<p class="text-gray-500">• ${reason}</p>`).join('')}
    `;

    // Update long-term signals
    const longTermSignal = window.TradingBot.computeLongTermSignal(stockData);
    longTermStatus.textContent = `Signal: ${longTermSignal.signalType}`;
    longTermStatus.className = `text-sm font-medium ${
      longTermSignal.signalType === 'BUY' ? 'text-green-600' :
      longTermSignal.signalType === 'SELL' ? 'text-red-600' :
      'text-gray-600'
    }`;
    
    longTermIndicators.innerHTML = `
      <p>50 EMA: ₹${stockData.ema50.toFixed(2)}</p>
      <p>200 EMA: ₹${stockData.ema200.toFixed(2)}</p>
      <p>MACD: ${stockData.macdLine.toFixed(3)}</p>
      ${longTermSignal.reasons.map(reason => `<p class="text-gray-500">• ${reason}</p>`).join('')}
    `;
  }

  function showError(message) {
    // Clear existing data
    stockData = null;
    priceCard.classList.add('hidden');
    intradayStatus.textContent = '';
    intradayIndicators.innerHTML = '';
    longTermStatus.textContent = '';
    longTermIndicators.innerHTML = '';

    // Show error message
    alert(message);
  }

  loadButton.addEventListener('click', () => {
    const symbol = stockSymbol.value.trim().toUpperCase();
    if (!symbol) {
      showError('Please enter a stock symbol');
      return;
    }
    if (!symbol.endsWith('.NS')) {
      showError('Please add .NS suffix for NSE stocks');
      return;
    }

    // Clear existing interval if any
    if (updateInterval) {
      clearInterval(updateInterval);
    }

    // Fetch initial data
    fetchStockData(symbol);

    // Set up auto-refresh every minute
    updateInterval = setInterval(() => {
      fetchStockData(symbol);
    }, 60000);
  });
});
