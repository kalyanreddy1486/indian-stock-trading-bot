// Background service worker for Indian Stock Trading Bot

// Function to check market hours (9:15 AM to 3:30 PM IST on weekdays)
function isMarketOpen() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
  const day = ist.getDay();
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const time = hour * 100 + minute;

  return day >= 1 && day <= 5 && // Monday to Friday
         time >= 915 && time <= 1530; // 9:15 AM to 3:30 PM
}

// Function to send notifications
async function sendNotification(signal, stockSymbol) {
  const options = {
    type: 'basic',
    iconUrl: signal.signalType === 'BUY' ? 'icons/buy.png' : 
            signal.signalType === 'SELL' ? 'icons/sell.png' : 
            'icons/hold.png',
    title: `${signal.signalType} Signal: ${stockSymbol}`,
    message: signal.reasons.join('\n'),
    priority: 2
  };

  chrome.notifications.create(`signal_${Date.now()}`, options);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'MARKET_STATUS') {
    sendResponse({ isOpen: isMarketOpen() });
  }
  else if (request.type === 'NEW_SIGNAL') {
    sendNotification(request.signal, request.symbol);
  }
  return true;
});

// Initialize alarm for market open/close notifications
chrome.alarms.create('marketStatus', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'marketStatus') {
    const isOpen = isMarketOpen();
    chrome.storage.local.get(['lastMarketStatus'], (result) => {
      if (result.lastMarketStatus !== isOpen) {
        const options = {
          type: 'basic',
          iconUrl: isOpen ? 'icons/open.png' : 'icons/closed.png',
          title: isOpen ? 'Market Open' : 'Market Closed',
          message: isOpen ? 'NSE market is now open for trading' : 'NSE market is now closed',
          priority: 2
        };
        chrome.notifications.create(`market_${Date.now()}`, options);
        chrome.storage.local.set({ lastMarketStatus: isOpen });
      }
    });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    lastMarketStatus: isMarketOpen(),
    watchlist: [],
    settings: {
      notifications: true,
      autoRefresh: true,
      refreshInterval: 60
    }
  });
});
