// Content script for Indian Stock Trading Bot

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INJECT_SIGNALS') {
    injectSignals(request.data);
  }
  return true;
});

// Function to inject trading signals into supported websites
function injectSignals(data) {
  // Support for common Indian stock trading websites
  if (window.location.hostname.includes('nseindia.com')) {
    injectNSESignals(data);
  }
  else if (window.location.hostname.includes('moneycontrol.com')) {
    injectMoneyControlSignals(data);
  }
}

// Inject signals into NSE website
function injectNSESignals(data) {
  const container = document.createElement('div');
  container.id = 'trading-bot-signals';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 9999;
    width: 300px;
  `;

  const signalHTML = `
    <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
      <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: bold;">Trading Signals</h3>
      <div style="margin-bottom: 10px;">
        <div style="font-weight: 500; color: ${getSignalColor(data.intradaySignal.signalType)}">
          Intraday: ${data.intradaySignal.signalType}
        </div>
        <div style="font-size: 12px; color: #666;">
          ${data.intradaySignal.reasons.join('<br>')}
        </div>
      </div>
      <div>
        <div style="font-weight: 500; color: ${getSignalColor(data.longTermSignal.signalType)}">
          Long Term: ${data.longTermSignal.signalType}
        </div>
        <div style="font-size: 12px; color: #666;">
          ${data.longTermSignal.reasons.join('<br>')}
        </div>
      </div>
    </div>
    <div style="font-size: 12px; color: #666; text-align: right;">
      Powered by Indian Stock Trading Bot
    </div>
  `;

  container.innerHTML = signalHTML;
  document.body.appendChild(container);

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
  `;
  closeButton.onclick = () => container.remove();
  container.appendChild(closeButton);
}

// Inject signals into MoneyControl website
function injectMoneyControlSignals(data) {
  // Similar to NSE injection but adapted for MoneyControl's layout
  const container = document.createElement('div');
  // ... (similar implementation as NSE but with MoneyControl-specific adjustments)
}

// Helper function to get color based on signal type
function getSignalColor(signalType) {
  switch (signalType) {
    case 'BUY':
      return '#10B981'; // green
    case 'SELL':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
}

// Initialize any page-specific features
function initialize() {
  // Add any page load initialization here
  console.log('Indian Stock Trading Bot: Content script initialized');
}

initialize();
