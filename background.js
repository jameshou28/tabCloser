// Initialize blocklist with default empty array if not exists
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedUrls'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.sync.set({ blockedUrls: [] });
    }
  });
});

// Check URL when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only check when the tab is completely loaded
  if (changeInfo.status === 'complete' && tab.url) {
    checkAndCloseTab(tabId, tab.url);
  }
});

// Check URL when tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkAndCloseTab(tab.id, tab.url);
  }
});

function checkAndCloseTab(tabId, url) {
  chrome.storage.sync.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    
    // Check if the current URL matches any blocked URL
    const shouldBlock = blockedUrls.some(blockedUrl => {
      // Convert both URLs to lowercase for case-insensitive comparison
      const currentUrl = url.toLowerCase();
      const blocked = blockedUrl.toLowerCase();
      
      // Check for exact match or if the blocked URL is contained in the current URL
      return currentUrl === blocked || currentUrl.includes(blocked);
    });
    
    if (shouldBlock) {
      chrome.tabs.remove(tabId);
      console.log(`Closed tab with URL: ${url}`);
    }
  });
}
