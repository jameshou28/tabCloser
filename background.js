// initialize blocklist with default empty array if not exists
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedUrls', 'lockState'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.sync.set({ blockedUrls: [] });
    }
    if (!result.lockState) {
      chrome.storage.sync.set({ lockState: { type: 'none' } });
    }
  });
});

// check link when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkAndCloseTab(tabId, tab.url);
  }
});

// check link when tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkAndCloseTab(tab.id, tab.url);
  }
});

function checkAndCloseTab(tabId, url) {
  chrome.storage.sync.get(['blockedUrls', 'lockState'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    const lockState   = result.lockState   || { type: 'none' };

    // If time lock has expired, clear it automatically
    if (lockState.type === 'time' && Date.now() >= lockState.unlockAt) {
      chrome.storage.sync.set({ lockState: { type: 'none' } });
    }

    const shouldBlock = blockedUrls.some(blockedUrl => {
      const currentUrl = url.toLowerCase();
      const blocked    = blockedUrl.toLowerCase();
      return currentUrl === blocked || currentUrl.includes(blocked);
    });

    if (shouldBlock) {
      chrome.tabs.remove(tabId);
    }
  });
}
