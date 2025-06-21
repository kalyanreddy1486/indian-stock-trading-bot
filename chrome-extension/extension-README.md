# Indian Stock Trading Bot - Chrome Extension

A powerful Chrome extension for real-time Indian stock trading analysis with intraday and long-term signals.

## Features

### Real-Time Trading Signals
- Intraday signals based on RSI, VWAP, Volume, and EMA crossovers
- Long-term signals using 50/200 EMA crossovers and MACD
- Automatic market hours detection (9:15 AM - 3:30 PM IST)
- Push notifications for new trading signals

### Technical Analysis
- RSI (Relative Strength Index)
- VWAP (Volume Weighted Average Price)
- Multiple EMA periods (9, 21, 50, 200)
- MACD with signal line
- Volume analysis

### Website Integration
- Seamless integration with NSE India website
- Support for MoneyControl
- Floating signal overlay on supported websites
- Easy-to-use popup interface

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Click the extension icon to open the popup
2. Enter an NSE stock symbol (e.g., RELIANCE.NS)
3. Click "Load" to analyze the stock
4. View intraday and long-term signals
5. Receive notifications for new signals
6. See overlay on supported trading websites

## Permissions
- activeTab: Required to inject signals into trading websites
- storage: Store watchlist and settings
- notifications: Send trading signal alerts
- host permissions: Access Yahoo Finance API

## Market Hours
- Active during NSE market hours (9:15 AM - 3:30 PM IST)
- Long-term signals available 24/7
- Automatic market open/close notifications

## Technical Details
- Uses Yahoo Finance API for real-time data
- Implements standard technical indicators
- Real-time calculations and updates
- Efficient data caching
- Background service worker for notifications

## Development

### Project Structure
```
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js             # Popup logic
├── background.js        # Service worker
├── contentScript.js     # Website integration
├── tradingLogic.js     # Trading calculations
└── icons/              # Extension icons
```

### Building
No build step required. The extension can be loaded directly into Chrome.

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Disclaimer
This extension is for educational and research purposes only. Always conduct your own research and consult with a financial advisor before making investment decisions.

## License
MIT License - feel free to use this code for your own projects.
